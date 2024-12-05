const { Builder, By, Key, until } = require('selenium-webdriver');

(async function crudTest() {
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        await driver.get('http://localhost:3000');

        // Login
        await driver.findElement(By.id('username')).sendKeys('user1');
        await driver.findElement(By.id('password')).sendKeys('user123');
        await driver.findElement(By.css('button[type="submit"]')).click();

        // Warten, bis Events geladen sind
        await driver.wait(until.elementLocated(By.id('event-container')), 10000);

        // Neues Event hinzufügen
        await driver.findElement(By.id('add-event')).click();
        await driver.findElement(By.id('event-title')).sendKeys('Testevent');
        await driver.findElement(By.id('event-date')).sendKeys('2024-12-20T12:00');
        await driver.findElement(By.css('button[type="submit"]')).click();

        // Warten auf Rückkehr zur Liste
        await driver.wait(until.elementLocated(By.id('event-list')), 5000);
        console.log('Neues Event hinzugefügt.');

        // Event löschen (nimm das erste Event der Liste)
        await driver.findElement(By.xpath("//li/button[contains(text(), 'Löschen')]")).click();
        console.log('Event gelöscht.');

    } catch (e) {
        console.error('CRUD-Test fehlgeschlagen:', e.message);
    } finally {
        await driver.quit();
    }
})();
