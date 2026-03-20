export default async function handler(req, res) {
    try {
        // Hangi ürünün sayfasını kazımak istiyorsan URL'yi ona göre güncelle
        // Örnek: Elektrik (ID: 1) sayfası
        const response = await fetch("https://simcotools.com/tr/realms/0/resources/1");
        const html = await response.text();

        // HTML içindeki <span class="text-4xl font-black">680</span> yapısını arıyoruz
        const regex = /<span class="text-4xl font-black">([\d.,]+)<\/span>/;
        const match = html.match(regex);
        
        const price = match ? match[1] : "Yüklenemedi";

        res.status(200).json({ price });
    } catch (error) {
        res.status(500).json({ error: "Veri çekilirken bir sorun oluştu." });
    }
}
