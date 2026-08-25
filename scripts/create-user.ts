import 'dotenv/config'
import { pbkdf2Sync, randomBytes } from 'node:crypto'
import { createUser, pool } from '../src/db'
import { isListScope, type UserScope } from '../src/types'

async function main() {
  const args = process.argv

  if (args.length < 6) {
    console.error('bun create-user [USUARIO] [CONTRASEÑA] [SCOPE (lospuentes, terralta o admin)] [ADMIN]')
    process.exit(1)
  }

  const username = args[2]
  const password = args[3]
  const scopeArg = args[4]
  const admin = args[5] === 'true'

  if (!isListScope(scopeArg) && scopeArg !== 'admin') {
    console.error('La variable de "scope" solamente puede ser "lospuentes", "terralta" o "admin"')
    process.exit(1)
  }

  const scope = scopeArg as UserScope
  const salt = randomBytes(128).toString('hex')
  const hash = pbkdf2Sync(password, salt, 10000, 128, 'sha512').toString('hex')

  await createUser({ username, salt, hash, scope, admin })
  console.log(`Created user ${username} with scope ${scope}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await pool.end()
  })
