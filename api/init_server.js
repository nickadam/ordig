'use strict'
const generate_keypair = require('./generate_keypair')

module.exports = (db, next) => {
  db.serialize(() => {
    // create tables
    db.run('CREATE TABLE IF NOT EXISTS server (keypair TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)')
    db.run('CREATE TABLE IF NOT EXISTS networks (ip TEXT KEY, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)')
    db.run('CREATE TABLE IF NOT EXISTS clients (hostname TEXT KEY, ip TEXT, key TEXT, keypair TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)')
    db.get('SELECT * FROM server', (err, row) => {
      if(err){
        next(err)
      }else if(!row){
        const stmt = db.prepare('INSERT INTO server (keypair) VALUES (?)')
        stmt.run(JSON.stringify(generate_keypair()))
        stmt.finalize()
        db.get('SELECT * FROM server', (err, row) => {
          // send new server keypair
          next(null, JSON.parse(row.keypair))
        })
      }else{
        // send server keypair
        next(null, JSON.parse(row.keypair))
      }
    })
  })
}
