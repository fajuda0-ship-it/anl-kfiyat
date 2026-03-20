export default async function handler(req, res) {
    try {
        const response = await fetch("https://api.simcotools.com/v1/realms/0/market/prices");
        const data = await response.json();
        
        // Veriyi başarıyla aldık, şimdi senin sayfana gönderiyoruz
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Veri çekilemedi" });
    }
}
