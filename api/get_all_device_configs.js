'use strict'

module.exports = (db, next) => {
  db.all('SELECT * FROM clients', (err, rows) => {
    if(err){
      next(err)
    }else{
      next(null, rows.map(i => {
        return {ip: i.ip, public_key: JSON.parse(i.keypair).public_key}
      }))
    }
  })
}
