const userAgent = process.env.npm_config_user_agent ?? '';
const packageManager = userAgent.split('/')[0];
const isBun = (process.env.npm_execpath ?? '').toLowerCase().includes('bun');

if (!isBun && ['npm', 'pnpm', 'yarn'].includes(packageManager)) {
  console.error('NodoVec Web solo admite Bun. Ejecuta: bun install');
  process.exit(1);
}
