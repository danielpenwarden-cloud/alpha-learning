import { useState } from 'react';

const SOURCE_OPTIONS = ['School Report', 'Photo', 'App Screenshot', 'Video', 'Other'];

export default function UploadModal({ onClose, onUpload }) {
  const [file, setFile] = useState(null);
  const [source, setSource] = useState('');
  const [uploading, setUploading] = useState(false);

  async function handleUpload() {
    if (!file || !source) return;
    setUploading(true);
    try {
      await onUpload({ file, source });
      onClose();
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative bg-bg-card border border-border rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-text-primary text-lg font-semibold">Upload Document</h3>
          <button onClick={onClose} className="text-text-dim hover:text-text-secondary text-xl">&times;</button>
        </div>

        {/* File input */}
        <div className="mb-4">
          <label className="text-text-secondary text-xs block mb-1.5">File</label>
          <div className="border border-dashed border-border rounded-lg p-6 text-center hover:border-text-dim transition-colors cursor-pointer"
            onClick={() => document.getElementById('file-input').click()}>
            {file ? (
              <div>
                <p className="text-text-primary text-sm">{file.name}</p>
                <p className="text-text-dim text-xs mt-1">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
            ) : (
              <div>
                <p className="text-text-muted text-2xl mb-1">{'\u{1F4CE}'}</p>
                <p className="text-text-secondary text-sm">Click to select a file</p>
                <p className="text-text-dim text-xs mt-1">PDF, images, or video</p>
              </div>
            )}
          </div>
          <input
            id="file-input"
            type="file"
            accept="image/*,.pdf,.mp4,.mov"
            onChange={e => setFile(e.target.files[0])}
            className="hidden"
          />
        </div>

        {/* Source selector */}
        <div className="mb-5">
          <label className="text-text-secondary text-xs block mb-1.5">Source</label>
          <div className="flex flex-wrap gap-1.5">
            {SOURCE_OPTIONS.map(s => (
              <button
                key={s}
                onClick={() => setSource(s)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  source === s
                    ? 'border-literacy text-literacy bg-literacy/10'
                    : 'border-border text-text-dim hover:text-text-muted'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Upload button */}
        <button
          onClick={handleUpload}
          disabled={!file || !source || uploading}
          className="w-full py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-30 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #f97316, #0ea5e9)' }}
        >
          {uploading ? 'Uploading...' : 'Upload & Analyze'}
        </button>
      </div>
    </div>
  );
}
