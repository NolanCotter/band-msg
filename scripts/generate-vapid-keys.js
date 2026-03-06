import webPush from 'web-push';

const vapidKeys = webPush.generateVAPIDKeys();

console.log('VAPID Public Key:');
console.log(vapidKeys.publicKey);
console.log('\nVAPID Private Key:');
console.log(vapidKeys.privateKey);
console.log('\nAdd these to your .env.local file:');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
