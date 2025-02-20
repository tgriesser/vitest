import { resolve } from 'pathe'
import { execa } from 'execa'
import { expect, it } from 'vitest'

it('should fail', async() => {
  const root = resolve(__dirname, '../fixtures')
  let error: any
  await execa('npx', ['vitest'], {
    cwd: root,
    env: {
      ...process.env,
      CI: 'true',
      NO_COLOR: 'true',
    },
  })
    .catch((e) => {
      error = e
    })

  expect(error).toBeTruthy()
  const msg = String(error)
    .split(/\n/g)
    .reverse()
    .find(i => i.includes('Error: '))
    ?.trim()
  expect(msg).toBe('Error: error')
}, 50000)
