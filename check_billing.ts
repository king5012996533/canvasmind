import 'dotenv/config'
import mariadb from 'mariadb'

async function main() {
  const conn = await mariadb.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '1q2w3e4r',
    database: 'canana_mind',
  })

  const rows = await conn.query("SELECT name, model_key, JSON_EXTRACT(default_params_json, '$.billingRule') AS br FROM ai_models WHERE category = 'VIDEO'")
  
  console.log(`\n=== VIDEO models (${rows.length}) ===\n`)
  for (const r of rows) {
    const br = typeof r.br === 'string' ? JSON.parse(r.br) : r.br
    console.log(`Model: ${r.name} (${r.model_key})`)
    console.log(`  billingType: ${br?.billingType || 'flat'}`)
    if (br?.billingType === 'per_second') {
      console.log(`  pricingMatrix:`)
      for (const [res, rates] of Object.entries(br.pricingMatrix || {})) {
        const rr = rates as any
        console.log(`    ${res}: t2v=${rr?.text_to_video}, i2v=${rr?.uploaded_video}`)
      }
      console.log(`  durationMode: ${br.durationMode}`)
    } else {
      console.log(`  power: ${br?.power}, unit: ${br?.unit}`)
    }
    console.log()
  }

  const imgRows = await conn.query("SELECT name, model_key, JSON_EXTRACT(default_params_json, '$.billingRule') AS br FROM ai_models WHERE category = 'IMAGE' AND is_enabled = 1 LIMIT 5")
  console.log(`=== IMAGE models (${imgRows.length}) ===`)
  for (const r of imgRows) {
    const br = typeof r.br === 'string' ? JSON.parse(r.br) : r.br
    console.log(`  ${r.name}: power=${br?.power}, unit=${br?.unit}`)
  }

  await conn.end()
}

main().then(() => process.exit(0)).catch(e => { console.error(e.message); process.exit(1) })
