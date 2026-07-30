import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("exports the YouX dashboard as a static page", async () => {
  const html = await readFile(
    new URL("../out/index.html", import.meta.url),
    "utf8",
  );
  assert.match(html, /<html lang="pt-BR">/i);
  assert.match(html, /<title>YouX<\/title>/i);
  assert.match(html, /Olá, Pedro\./);
  assert.match(html, /Minha semana/);
  assert.match(html, /Modo foco/);
  assert.match(html, /Insights/);
  assert.match(html, /Ir para o conteúdo principal/);
  assert.match(html, /aria-label="Navegação principal"/);
  assert.doesNotMatch(html, /sign in|login|autentica(?:ção|r)/i);
});

test("keeps validation, accessibility and safe storage in the client", async () => {
  const [page, css, layout, packageJson, envExample, todo] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../.env.example", import.meta.url), "utf8"),
    readFile(new URL("../TODO.md", import.meta.url), "utf8"),
  ]);

  assert.match(page, /safeTitle\.length < 3/);
  assert.match(page, /safeTitle\.length > 80/);
  assert.match(page, /COURSE_OPTIONS\.includes/);
  assert.match(page, /function loadStoredTasks/);
  assert.match(page, /localStorage\.setItem/);
  assert.match(page, /aria-live="polite"/);
  assert.match(page, /TODO: substituir o armazenamento local por uma API autenticada/);
  assert.doesNotMatch(page, /dangerouslySetInnerHTML/);

  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /\.high-contrast/);
  assert.match(layout, /lang="pt-BR"/);
  assert.match(packageJson, /"name": "youx-ihc"/);
  assert.match(envExample, /^NEXT_PUBLIC_APP_ENV=development$/m);
  assert.doesNotMatch(envExample, /(SECRET|TOKEN|API_KEY|PASSWORD)=\S+/i);
  assert.match(todo, /continuidade do YouX/);
});
