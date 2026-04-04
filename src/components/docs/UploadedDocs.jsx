import { useState, useEffect, useRef } from 'react';
import UploadModal from './UploadModal';
import { useStudent } from '../../hooks/useStudent';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../shared/Toast';
import { redactForAI } from '../../lib/pii';
import { stripExif } from '../../lib/exif';
import { analyzeDocument, buildStudentContext } from '../../lib/ai';
import { pdfToImages } from '../../lib/pdf';
import { uploadFileToStorage, saveDocument, fetchDocuments, updateDocument, deleteDocument, deleteAllDocuments } from '../../lib/db';
import { MILESTONES } from '../../data/milestones';

const TYPE_ICONS = {
  pdf: '\u{1F4C4}',
  image: '\u{1F5BC}\uFE0F',
  video: '\u{1F3AC}',
  audio: '\u{1F3B5}',
};

const STATUS_MAP = {
  'not-started': 0,
  'emerging': 1,
  'in-progress': 2,
  'proficient': 3,
  'mastered': 4,
};

const STORAGE_KEY = 'alpha-docs';

function loadLocalDocs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveLocalDocs(docs) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(docs)); } catch {}
}

function mapDbDoc(d) {
  return {
    id: d.id,
    fileName: d.file_name,
    fileType: d.file_type,
    source: d.source,
    uploadedAt: d.uploaded_at?.split('T')[0] || '',
    aiExtracted: d.ai_extracted,
    aiInsights: d.ai_insights,
    linkedMilestones: d.linked_milestones || [],
    filePath: d.file_path,
    piiRedacted: d.pii_detected,
    fileSize: d.file_size || null,
  };
}

export default function UploadedDocs() {
  const { student, age, milestoneStatus, domainScores, updateMilestone, isOnline } = useStudent();
  const { user, isDemo, exitDemo } = useAuth();
  const { addToast } = useToast();
  const [showUpload, setShowUpload] = useState(false);
  const [documents, setDocuments] = useState(loadLocalDocs);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(null);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(null); // { file, source, existing }
  const loadedRef = useRef(false);

  // Persist to localStorage whenever documents change
  useEffect(() => { saveLocalDocs(documents); }, [documents]);

  // Load documents from Supabase when online (merge with local)
  useEffect(() => {
    if (!isOnline || student.id === 'default' || loadedRef.current) return;
    loadedRef.current = true;
    setLoadingDocs(true);

    fetchDocuments(student.id).then(dbDocs => {
      if (dbDocs.length > 0) {
        const mapped = dbDocs.map(mapDbDoc);
        // Merge: DB is source of truth, but keep any local-only docs not yet saved
        setDocuments(prev => {
          const dbIds = new Set(mapped.map(d => d.id));
          const localOnly = prev.filter(d => !dbIds.has(d.id));
          return [...mapped, ...localOnly];
        });
      }
    }).finally(() => setLoadingDocs(false));
  }, [isOnline, student.id]);

  /** Convert a File to base64 (for image vision analysis) */
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // result is "data:image/jpeg;base64,XXXXXX" — strip the prefix
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /** Check for duplicate before uploading */
  function handleUploadWithDupeCheck({ file, source }) {
    const existing = documents.find(d =>
      d.fileName === file.name && (d.fileSize == null || d.fileSize === file.size)
    );
    if (existing) {
      setDuplicateWarning({ file, source, existing });
      return;
    }
    return doUpload({ file, source });
  }

  function confirmDuplicate() {
    if (duplicateWarning) {
      doUpload({ file: duplicateWarning.file, source: duplicateWarning.source });
      setDuplicateWarning(null);
    }
  }

  /** Full pipeline: upload → EXIF strip → store → AI analyze → update milestones */
  async function doUpload({ file, source }) {
    const fileType = file.type.startsWith('image') ? 'image'
      : file.type.includes('pdf') ? 'pdf'
      : file.type.startsWith('video') ? 'video' : 'audio';

    setUploading(true);

    try {
      // Step 1: Strip EXIF from images
      let processedFile = file;
      if (file.type.startsWith('image/')) {
        processedFile = await stripExif(file);
      }

      // Step 2: PII redaction on filename
      const { redacted: safeFileName, log: fileNamePII } = redactForAI(file.name, student.firstName);

      // Step 3: Upload to Supabase Storage if online
      let filePath = null;
      if (isOnline && student.id !== 'default') {
        filePath = await uploadFileToStorage(student.id, processedFile);
      }

      // Step 4: Create doc record
      const newDoc = {
        id: Date.now().toString(),
        fileName: file.name,
        fileSize: file.size,
        fileType,
        source,
        uploadedAt: new Date().toISOString().split('T')[0],
        aiExtracted: false,
        aiInsights: null,
        linkedMilestones: [],
        piiRedacted: fileNamePII.length > 0,
        filePath,
      };

      // Save to Supabase
      if (isOnline && student.id !== 'default' && user) {
        const saved = await saveDocument(student.id, user.id, {
          fileName: file.name,
          fileType,
          filePath,
          source,
          aiExtracted: false,
          linkedMilestones: [],
        });
        if (saved) newDoc.id = saved.id;
      }

      setDocuments(prev => [newDoc, ...prev]);
      setUploading(false);
      addToast('Document uploaded successfully', { type: 'success' });

      // Step 5: AI analysis pipeline (async, non-blocking)
      runAIAnalysis(newDoc, processedFile, fileType, safeFileName);
    } catch (err) {
      setUploading(false);
      addToast(`Upload failed: ${err.message}`, { type: 'error' });
    }
  }

  /** Run AI analysis on an uploaded document */
  async function runAIAnalysis(doc, file, fileType, safeFileName) {
    setAnalyzing(doc.id);

    try {
      // Build student context for AI
      const studentCtx = buildStudentContext(student, age, milestoneStatus, domainScores, MILESTONES);

      let analysisOptions = { fileName: safeFileName };

      // Extract content based on file type
      if (fileType === 'image') {
        const base64 = await fileToBase64(file);
        analysisOptions.imageBase64 = base64;
        analysisOptions.imageMimeType = file.type || 'image/jpeg';
      } else if (fileType === 'pdf') {
        // Render PDF pages to images for Claude vision analysis
        const pages = await pdfToImages(file, { maxPages: 5, scale: 2 });
        if (pages.length > 0) {
          analysisOptions.pageImages = pages;
        }
      }

      // Call AI
      const result = await analyzeDocument(fileType, studentCtx, analysisOptions);

      // Step 6: Process findings — update milestone progress
      const linkedMilestones = [];
      if (result.findings && result.findings.length > 0) {
        for (const finding of result.findings) {
          const milestone = MILESTONES.find(m => m.id === finding.milestoneId);
          if (!milestone) continue;

          linkedMilestones.push(finding.milestoneId);

          // Only update if confidence is medium+ and represents progress
          if (finding.confidence === 'low') continue;

          const current = milestoneStatus[finding.milestoneId];
          const currentLevel = STATUS_MAP[current?.status || 'not-started'] || 0;
          const newLevel = STATUS_MAP[finding.observedLevel] || 0;

          // Only upgrade, never downgrade from AI evidence
          if (newLevel > currentLevel || (finding.suggestedProgress && finding.suggestedProgress > (current?.progress || 0))) {
            const updates = {};
            if (newLevel > currentLevel) {
              updates.status = finding.observedLevel;
            }
            if (finding.suggestedProgress && finding.suggestedProgress > (current?.progress || 0)) {
              updates.progress = finding.suggestedProgress;
            }
            updates.evidenceNotes = [
              current?.evidenceNotes || '',
              `[AI ${new Date().toLocaleDateString()}] ${finding.evidence}`,
            ].filter(Boolean).join(' | ');

            updateMilestone(finding.milestoneId, updates);
          }
        }
      }

      // Build summary
      const summary = result.summary || result.findings?.map(f =>
        `${f.milestoneId}: ${f.evidence} (${f.confidence})`
      ).join('. ') || 'No specific milestone evidence found.';

      // Step 7: Update document record with AI results
      const updatedDoc = {
        ...doc,
        aiExtracted: true,
        aiInsights: summary,
        linkedMilestones,
      };

      setDocuments(prev => prev.map(d => d.id === doc.id ? updatedDoc : d));

      // Persist to Supabase
      if (isOnline && doc.id && typeof doc.id === 'string' && doc.id.length > 10) {
        await updateDocument(doc.id, {
          aiExtracted: true,
          aiInsights: summary,
          linkedMilestones,
        });
      }

      if (linkedMilestones.length > 0) {
        addToast(`AI found evidence for ${linkedMilestones.length} milestone(s): ${linkedMilestones.join(', ')}`, { type: 'success' });
      } else {
        addToast('AI analysis complete — no specific milestone evidence found', { type: 'info' });
      }
    } catch (err) {
      console.error('AI analysis failed:', err);
      addToast(`AI analysis failed: ${err.message}`, { type: 'error' });
    } finally {
      setAnalyzing(null);
    }
  }

  function handleDelete(docId) {
    setDocuments(prev => prev.filter(d => d.id !== docId));
    // Delete from Supabase (fire-and-forget)
    if (isOnline) deleteDocument(docId);
    addToast('Document removed', { type: 'info' });
  }

  function handleClearAll() {
    setDocuments([]);
    // Delete all from Supabase (fire-and-forget)
    if (isOnline && student.id !== 'default') deleteAllDocuments(student.id);
    addToast('All documents cleared', { type: 'info' });
  }

  /** Re-analyze an existing document */
  async function handleReanalyze(doc) {
    setAnalyzing(doc.id);
    try {
      const studentCtx = buildStudentContext(student, age, milestoneStatus, domainScores, MILESTONES);
      const result = await analyzeDocument(doc.fileType, studentCtx, { fileName: doc.fileName });

      const linkedMilestones = result.findings?.map(f => f.milestoneId).filter(Boolean) || [];
      const summary = result.summary || 'Analysis complete.';

      const updatedDoc = { ...doc, aiExtracted: true, aiInsights: summary, linkedMilestones };
      setDocuments(prev => prev.map(d => d.id === doc.id ? updatedDoc : d));

      if (isOnline && doc.id && typeof doc.id === 'string' && doc.id.length > 10) {
        await updateDocument(doc.id, { aiExtracted: true, aiInsights: summary, linkedMilestones });
      }

      addToast('Re-analysis complete', { type: 'success' });
    } catch (err) {
      addToast(`Analysis failed: ${err.message}`, { type: 'error' });
    } finally {
      setAnalyzing(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-text-primary text-2xl">
            Uploaded Documents
          </h2>
          <p className="text-text-secondary text-sm mt-1 mb-4">
            School reports, photos, app screenshots, and videos — AI extracts learning evidence.
          </p>
        </div>
        <div className="flex gap-2">
          {documents.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-4 py-2 rounded-lg text-sm font-medium text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
            >
              Clear All
            </button>
          )}
          {isDemo ? (
            <button
              onClick={exitDemo}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}
            >
              Sign up to upload
            </button>
          ) : (
            <button
              onClick={() => setShowUpload(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}
            >
              Upload Document
            </button>
          )}
        </div>
      </div>

      {/* Upload tip */}
      <div className="bg-bg-card border border-border rounded-xl p-4 flex items-start gap-3">
        <span className="text-xl">{'\u{1F4F1}'}</span>
        <div>
          <h3 className="text-text-primary text-xs md:text-sm font-semibold">How It Works</h3>
          <p className="text-text-muted text-xs md:text-base mt-0.5 md:mt-1 md:leading-relaxed">
            Upload a photo, school report, or app screenshot. EXIF metadata is automatically stripped for privacy.
            The AI analyzes the document, extracts milestone evidence, and updates your child's progress automatically.
          </p>
        </div>
      </div>

      {uploading && (
        <div className="bg-bg-card border border-border rounded-xl p-6 text-center">
          <div className="w-8 h-8 rounded-lg mx-auto mb-2 animate-pulse flex items-center justify-center text-white font-bold"
            style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}>
            {'\u03B1'}
          </div>
          <p className="text-text-secondary text-sm">Uploading and stripping metadata...</p>
        </div>
      )}

      {/* Document list */}
      <div className="space-y-3">
        {documents.map(doc => (
          <div key={doc.id} className="bg-bg-card border border-border rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{TYPE_ICONS[doc.fileType] || '\u{1F4CE}'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-text-primary text-sm font-medium truncate">{doc.fileName}</span>
                  {analyzing === doc.id ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 animate-pulse">
                      Analyzing...
                    </span>
                  ) : doc.aiExtracted ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">
                      AI Analyzed
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">
                      Pending Analysis
                    </span>
                  )}
                  {doc.piiRedacted && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                      PII Redacted
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-text-dim">
                  <span>{doc.source}</span>
                  <span>{doc.uploadedAt}</span>
                  {doc.filePath && (
                    <span className="text-green-600">{'\u2601\uFE0F'} Cloud</span>
                  )}
                </div>

                {doc.aiInsights && (
                  <div className="mt-2 p-2.5 bg-bg-hover rounded-lg">
                    <p className="text-text-secondary text-xs leading-relaxed">{doc.aiInsights}</p>
                  </div>
                )}

                {doc.linkedMilestones?.length > 0 && (
                  <div className="flex gap-1.5 mt-2">
                    {doc.linkedMilestones.map(m => (
                      <span key={m} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-hover text-text-muted border border-border-light">
                        {m}
                      </span>
                    ))}
                  </div>
                )}

                {/* Re-analyze button for docs without AI analysis */}
                {!doc.aiExtracted && analyzing !== doc.id && (
                  <button
                    onClick={() => handleReanalyze(doc)}
                    className="mt-2 text-xs text-literacy hover:underline"
                  >
                    Analyze with AI
                  </button>
                )}
              </div>
              <button
                onClick={() => handleDelete(doc.id)}
                className="text-text-dim hover:text-red-600 transition-colors p-1 -mt-1 -mr-1 shrink-0"
                title="Delete document"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {loadingDocs && documents.length === 0 && (
        <div className="bg-bg-card border border-border rounded-xl p-6 text-center">
          <div className="w-6 h-6 rounded-lg mx-auto mb-2 animate-pulse flex items-center justify-center text-white font-bold text-xs"
            style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}>
            {'\u03B1'}
          </div>
          <p className="text-text-dim text-sm">Loading documents...</p>
        </div>
      )}

      {!loadingDocs && documents.length === 0 && (
        <div className="bg-bg-card border border-border rounded-xl p-8 text-center">
          <p className="text-text-dim text-sm md:text-lg md:leading-relaxed">No documents uploaded yet. Upload school reports, photos, or screenshots to start tracking evidence.</p>
        </div>
      )}

      {showUpload && (
        <UploadModal onClose={() => setShowUpload(false)} onUpload={handleUploadWithDupeCheck} />
      )}

      {/* Duplicate warning dialog */}
      {duplicateWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setDuplicateWarning(null)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-bg-card border border-orange-200 rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-text-primary text-sm font-semibold mb-2">Duplicate detected</h3>
            <p className="text-text-secondary text-xs mb-1">
              A file named <span className="text-text-primary font-medium">"{duplicateWarning.existing.fileName}"</span> was already uploaded on {duplicateWarning.existing.uploadedAt}.
            </p>
            <p className="text-text-muted text-xs mb-4">
              Re-uploading won't double-count milestone evidence — only the highest progress applies. Upload anyway?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDuplicateWarning(null)}
                className="flex-1 py-2 rounded-lg text-xs font-medium text-text-secondary bg-bg-hover border border-border hover:bg-bg-card transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDuplicate}
                className="flex-1 py-2 rounded-lg text-xs font-medium text-white"
                style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}
              >
                Upload Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
