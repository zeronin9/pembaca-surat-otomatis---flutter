import test from 'node:test';
import assert from 'node:assert/strict';
import { deleteLetterFile, getLetterFile, saveLetterFile } from './fileStorage';

test('fileStorage saves, retrieves, and deletes blobs via fallback when IndexedDB is absent', async () => {
  const sampleBlob = new Blob(['konten-surat-pdf'], { type: 'application/pdf' });

  await saveLetterFile('test-id-1', sampleBlob, {
    fileName: 'surat-test.pdf',
    mimeType: 'application/pdf',
    sizeBytes: sampleBlob.size,
  });

  const loaded = await getLetterFile('test-id-1');
  assert.ok(loaded);
  assert.equal(loaded.fileName, 'surat-test.pdf');
  assert.equal(loaded.mimeType, 'application/pdf');
  assert.equal(await loaded.blob.text(), 'konten-surat-pdf');

  await deleteLetterFile('test-id-1');
  const afterDelete = await getLetterFile('test-id-1');
  assert.equal(afterDelete, null);
});
