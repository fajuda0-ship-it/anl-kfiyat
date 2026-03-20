// Ürün isimlerini hafızada tutmak için değişken
let resourceCache = {};

// 1. ADIM: Ürün isimlerini çeken fonksiyon
async function loadResourceNames() {
    try {
        // Not: Eğer isimlerde de CORS hatası alırsan, bunu da API klasörüne taşımamız gerekebilir.
        const response = await fetch("https://api.simcotools.com/v1/realms/0/resources");
        const resources = await response.json();
        
        resources.forEach(res => {
            resourceCache[res.id] = res.name;
        });
        console.log("İsimler yüklendi.");
    } catch (error) {
        console.error("İsimler alınırken hata:", error);
    }
}

// 2. ADIM: Fiyatları senin oluşturduğun Vercel API üzerinden çeken fonksiyon
async function updatePrices() {
    const tableBody = document.getElementById('price-table');
    const status = document.getElementById('status');
    
    // Eğer isimler henüz yüklenmediyse yükle
    if (Object.keys(resourceCache).length === 0) {
        await loadResourceNames();
    }

    try {
        status.innerText = "Veriler senkronize ediliyor...";
        
        // KRİTİK DEĞİŞİKLİK: Doğrudan Simcotools'a değil, kendi Vercel API'ne gidiyorsun
        const response = await fetch("/api/get-prices"); 
        
        if (!response.ok) throw new Error("API yanıt vermedi");
        
        const prices = await response.json();

        tableBody.innerHTML = "";

        // Verileri tabloya bas
        prices.forEach(item => {
            const productName = resourceCache[item.kind] || `Ürün ID: ${item.kind}`;
            
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
        status.innerText = "Hata: Veri çekilemedi. (API kontrol ediliyor...)";
        console.error("Fiyat hatası:", error);
    }
}

// 3. ADIM: Uygulamayı başlat
async function init() {
    await loadResourceNames();
    await updatePrices();
    
    // Her 5 dakikada bir otomatik yenile
    setInterval(updatePrices, 300000);
}

init();
