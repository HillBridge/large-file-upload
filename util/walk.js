const	NodeRSA = require('node-rsa');

const	newkey = new NodeRSA({b: 1024}); 

newkey.setOptions({encryptionScheme: 'pkcs1'});	

const   public_key = newkey.exportKey('pkcs8-public');
const	private_key = newkey.exportKey('pkcs8-private'); 





module.exports = {
	public_key,
	private_key
}


// const	newkey = new NodeRSA({b: 1024});  

// newkey.setOptions({encryptionScheme: 'pkcs1'});	

// const	public_key = newkey.exportKey('pkcs8-public');
// const	private_key = newkey.exportKey('pkcs8-private'); 

// //console.log("public_key+++",public_key)

// const   pubkey = new NodeRSA(public_key),
// 	  	prikey = new NodeRSA(private_key);
// pubkey.setOptions({encryptionScheme: 'pkcs1'});
// prikey.setOptions({encryptionScheme: 'pkcs1'});

// const   encrypted = pubkey.encrypt("bridge",'base64'); 
// const   decrypted = prikey.decrypt(encrypted, 'utf8'); 
// console.log("decrypted==",decrypted)

