const { Platform } = require('./models/platform'); // Import correct depuis models/index.js

async function testPlatform() {
  try {
    const platform = await Platform.create({
      balance: 1000000000,
    });

    console.log('Nouvelle plateforme créée avec un solde de :', platform.balance);

    platform.balance += 5000;
    await platform.save();
    console.log('Solde mis à jour :', platform.balance);

    const updatedPlatform = await Platform.findOne();
    console.log('Solde actuel dans la base :', updatedPlatform.balance);
  } catch (error) {
    console.error('Erreur lors de la manipulation du modèle Platform :', error);
  }
}

testPlatform();
