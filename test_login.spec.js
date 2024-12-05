const { Builder, By, Key, until } = require('selenium-webdriver');

(async function loginTest() {
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        await driver.get('http://localhost:3000'); // URL der App

        // Benutzername eingeben
        await driver.findElement(By.id('username')).sendKeys('admin');
        // Passwort eingeben
        await driver.findElement(By.id('password')).sendKeys('admin123');

        // Login absenden
        await driver.findElement(By.css('button[type="submit"]')).click();

        // Sicherstellen, dass ein Element der Event-Liste erscheint
        await driver.wait(until.elementLocated(By.id('event-container')), 10000);

        console.log('Login-Test erfolgreich');
    } catch (e) {
        console.error('Login-Test fehlgeschlagen:', e.message);
    } finally {
        await driver.quit();
    }
})();
