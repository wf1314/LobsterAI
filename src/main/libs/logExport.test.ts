import { expect, test } from 'vitest';

import { buildLogExportFileName } from './logExport';

test('buildLogExportFileName uses the IndustryAI file prefix', () => {
  const date = new Date(2026, 5, 23, 14, 5, 9);

  expect(buildLogExportFileName(date)).toBe('industryai-logs-20260623-140509.zip');
});
