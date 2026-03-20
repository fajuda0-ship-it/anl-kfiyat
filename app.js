// Global değişken: İsimleri bir kez çekip burada saklayacağız
let resourceCache = {};

// 1. ADIM: Ürün İsimlerini ve ID'lerini Eşleştir (Resources API)
async function loadResourceNames() {
    try {
        const response = await fetch("https://api.simcotools.com/v1/realms/0/resources");
        const resources = await response.json();
        
        // Veriyi { 1: "Power", 40: "Carbon Fiber" } formatına çeviriyoruz
        resources.forEach(res => {
            resourceCache[res.id] = res.name;
        });
        
        console.log("Ürün isimleri başarıyla yüklendi.");
    } catch (error) {
        console.error("İsimler çekilirken hata oluştu:", error);
    }
}

// 2. ADIM: Fiyatları Çek ve Tabloyu Güncelle
async function updatePrices() {
    const tableBody = document.getElementById('price-table');
    const status = document.getElementById('status');
    
    if (Object.keys(resourceCache).length === 0) {
        status.innerText = "İsimler senkronize ediliyor...";
        await loadResourceNames();
    }

    try {
        status.innerText = "Fiyatlar güncelleniyor...";
        const response = await fetch("https://api.simcotools.com/v1/realms/0/market/prices");
        const prices = await response.json();

        tableBody.innerHTML = "";

        // Veriyi fiyata göre sıralayalım (Opsiyonel: En ucuz en üstte)
        // prices.sort((a, b) => a.price - b.price);

        prices.forEach(item => {
            // ID'yi isme çevir, bulamazsan ID'yi yaz
            const productName = resourceCache[item.kind] || `ID: ${item.kind}`;
            
            // Satır oluşturma
            const row = `
                <tr class="border-b border-slate-700 hover:bg-slate-800 transition">
                    <td class="p-3 font-semibold text-slate-200">${productName}</td>
                    <td class="p-3 text-green-400 font-mono">$${item.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td class="p-3 text-slate-400 text-sm">${item.quantity.toLocaleString()} Adet</td>
                </tr>
            `;
            tableBody.insertAdjacentHTML('beforeend', row);
        });

        status.innerText = "Son Güncelleme: " + new Date().toLocaleTimeString();

    } catch (error) {
        status.innerText = "Hata: Fiyatlar alınamadı.";
        console.error("Fiyat Hatası:", error);
    }
}

// 3. ADIM: Başlatıcı
async function init() {
    // Önce isimleri yükle, sonra fiyatları getir
    await loadResourceNames();
    await updatePrices();
    
    // Her 5 dakikada bir (300.000 ms) fiyatları tazele
    // API limitlerine takılmamak için çok sık yapmamak iyidir.
    setInterval(updatePrices, 300000);
}

init();
