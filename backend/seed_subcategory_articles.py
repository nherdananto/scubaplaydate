"""Seed sample articles for every (category, subcategory) combination.

- Downloads stock images and stores them in /app/frontend/public/uploads/
  so the seed survives if the source URL goes away.
- Idempotent: only inserts articles whose slug doesn't already exist.
- Bilingual (English + Bahasa Indonesia).

Run: python /app/backend/seed_subcategory_articles.py
"""
import asyncio
import os
import uuid
import urllib.request
from datetime import datetime, timezone, timedelta
from pathlib import Path

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv('/app/backend/.env')

UPLOAD_DIR = Path("/app/frontend/public/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Stock images per subcategory key
IMAGE_SOURCES = {
    "destinations_asia": "https://images.unsplash.com/photo-1502600142672-7b6a76090c64?auto=format&fit=crop&w=1200&q=80",
    "destinations_global": "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=1200&q=80",
    "news_industry": "https://images.unsplash.com/photo-1559825481-12a05cc00344?auto=format&fit=crop&w=1200&q=80",
    "news_marinelife": "https://images.unsplash.com/photo-1582967788606-a171c1080cb0?auto=format&fit=crop&w=1200&q=80",
    "gear_comparisons": "https://images.unsplash.com/photo-1591025207163-942350e47db2?auto=format&fit=crop&w=1200&q=80",
    "training_tips": "https://images.unsplash.com/photo-1551244072-5d12893278ab?auto=format&fit=crop&w=1200&q=80",
    "photography_gear": "https://images.unsplash.com/photo-1495805442109-bf1cf975750b?auto=format&fit=crop&w=1200&q=80",
    "community_stories": "https://images.unsplash.com/photo-1530053969600-caed2596d242?auto=format&fit=crop&w=1200&q=80",
    "community_interviews": "https://images.unsplash.com/photo-1535083252457-839920eb45a4?auto=format&fit=crop&w=1200&q=80",
}


def download_image(key: str, source_url: str) -> str:
    """Download image to UPLOAD_DIR with a stable filename. Returns public URL."""
    filename = f"seed-{key}.jpg"
    target = UPLOAD_DIR / filename
    if not target.exists():
        try:
            req = urllib.request.Request(
                source_url,
                headers={"User-Agent": "Mozilla/5.0 (ScubaPlaydate Seed)"},
            )
            with urllib.request.urlopen(req, timeout=30) as resp:
                target.write_bytes(resp.read())
            print(f"  ↓ Downloaded {filename}")
        except Exception as e:
            print(f"  ✗ Failed to download {key}: {e}")
            # fall back to remote URL if download fails
            return source_url
    return f"/uploads/{filename}"


# (category, subcategory, slug, title_en, title_id, subtitle_en, subtitle_id, body_en, body_id, author, image_key, featured)
SAMPLES = [
    # ---- Destinations ----
    ("Destinations", "Asia",
     "diving-the-philippines-tubbataha-reef",
     "Diving the Philippines: Tubbataha Reef Wonders",
     "Menyelam di Filipina: Keajaiban Tubbataha Reef",
     "A UNESCO World Heritage site brimming with sharks, turtles, and pristine coral walls",
     "Situs Warisan Dunia UNESCO yang penuh dengan hiu, penyu, dan dinding karang yang masih alami",
     "<p>Tubbataha Reef sits in the heart of the Sulu Sea and is widely regarded as one of Asia's most breathtaking dive destinations.</p><h3>What to expect</h3><p>Liveaboard trips run from March to June, when conditions are calmest. Expect schooling jacks, gray reef sharks, and frequent manta sightings along the dramatic walls.</p>",
     "<p>Tubbataha Reef terletak di jantung Laut Sulu dan secara luas dianggap sebagai salah satu destinasi selam paling menakjubkan di Asia.</p><h3>Apa yang diharapkan</h3><p>Trip liveaboard berjalan dari Maret hingga Juni, saat kondisi paling tenang. Harapkan jack berkelompok, hiu karang abu-abu, dan pertemuan manta yang sering di sepanjang dinding dramatis.</p>",
     "Sarah Mitchell", "destinations_asia", False),

    ("Destinations", "Global",
     "exploring-galapagos-with-hammerheads",
     "Exploring the Galápagos with Hammerheads",
     "Menjelajahi Galápagos bersama Hiu Martil",
     "Why Darwin and Wolf Islands belong on every advanced diver's bucket list",
     "Mengapa Pulau Darwin dan Wolf wajib ada di daftar penyelam tingkat lanjut",
     "<p>The remote Galápagos archipelago is the holy grail for big-animal divers. Strong currents reward you with wall-to-wall hammerheads, whale sharks, and oceanic mantas.</p><h3>Best season</h3><p>June to November brings cooler water and the highest probability of whale shark encounters at Darwin Arch.</p>",
     "<p>Kepulauan Galápagos yang terpencil adalah cawan suci bagi penyelam hewan besar. Arus yang kuat memberikan imbalan berupa hiu martil, hiu paus, dan manta laut.</p><h3>Musim terbaik</h3><p>Juni hingga November membawa air yang lebih dingin dan probabilitas tertinggi untuk bertemu hiu paus di Darwin Arch.</p>",
     "Liam O'Connor", "destinations_global", True),

    # ---- News ----
    ("News", "Industry",
     "padi-launches-ai-dive-planner",
     "PADI Launches AI-Powered Dive Planner App",
     "PADI Meluncurkan Aplikasi Perencana Selam Bertenaga AI",
     "The certification giant rolls out a smart trip-planning tool for its 28 million members",
     "Raksasa sertifikasi meluncurkan alat perencanaan perjalanan cerdas untuk 28 juta anggotanya",
     "<p>PADI announced this week the launch of an AI-driven dive planner that combines real-time weather, tide, and visibility data with personalized site recommendations.</p><h3>What it means for divers</h3><p>The free app integrates with eLog and certification records, automatically suggesting sites that match each diver's experience level and recent activity.</p>",
     "<p>PADI mengumumkan minggu ini peluncuran perencana selam berbasis AI yang menggabungkan data cuaca, pasang surut, dan jarak pandang real-time dengan rekomendasi lokasi yang dipersonalisasi.</p><h3>Apa artinya bagi penyelam</h3><p>Aplikasi gratis ini terintegrasi dengan eLog dan catatan sertifikasi, secara otomatis menyarankan lokasi yang sesuai dengan tingkat pengalaman dan aktivitas terbaru setiap penyelam.</p>",
     "Maya Patel", "news_industry", False),

    ("News", "Marine Life",
     "rare-megamouth-shark-spotted-bali",
     "Rare Megamouth Shark Spotted Off Bali",
     "Hiu Megamouth Langka Terlihat di Lepas Pantai Bali",
     "Only the 273rd recorded sighting in history thrills marine biologists",
     "Hanya pengamatan ke-273 dalam sejarah ini menggetarkan para ahli biologi laut",
     "<p>Local divers near Tulamben captured rare footage of a megamouth shark earlier this month, marking only the 273rd confirmed sighting of the elusive deep-water species.</p><h3>Why it matters</h3><p>Megamouth sharks were unknown to science until 1976. Each new sighting gives researchers critical data on their distribution and behavior.</p>",
     "<p>Penyelam lokal di dekat Tulamben mengabadikan rekaman langka hiu megamouth awal bulan ini, menandai pengamatan terkonfirmasi ke-273 dari spesies laut dalam yang sulit ditangkap ini.</p><h3>Mengapa penting</h3><p>Hiu megamouth tidak dikenal ilmu pengetahuan hingga 1976. Setiap pengamatan baru memberi peneliti data penting tentang distribusi dan perilakunya.</p>",
     "Dr. James Chen", "news_marinelife", True),

    # ---- Gear ----
    ("Gear", "Comparisons",
     "shearwater-perdix-vs-teric-comparison",
     "Shearwater Perdix vs. Teric: Which Computer Wins?",
     "Shearwater Perdix vs. Teric: Komputer Selam Mana yang Menang?",
     "We put both flagship dive computers head-to-head across 30 dives",
     "Kami mengadu kedua komputer selam unggulan ini dalam 30 penyelaman",
     "<p>Shearwater's Perdix and Teric are both technical-grade computers, but they target very different divers. We tested them across recreational, deep, and CCR dives.</p><h3>Display & wear</h3><p>The Teric's wrist-watch form factor wins for everyday use. The Perdix's larger color screen is unbeatable for technical dives where readability matters most.</p><h3>Verdict</h3><p>Choose the Teric if you want to wear it daily. Choose the Perdix if your dives push past 40m or include decompression.</p>",
     "<p>Perdix dan Teric Shearwater keduanya adalah komputer kelas teknis, tetapi mereka menargetkan penyelam yang sangat berbeda. Kami mengujinya di penyelaman rekreasi, dalam, dan CCR.</p><h3>Layar & pemakaian</h3><p>Bentuk jam tangan Teric menang untuk penggunaan sehari-hari. Layar warna yang lebih besar pada Perdix tak tertandingi untuk penyelaman teknis di mana keterbacaan paling penting.</p><h3>Putusan</h3><p>Pilih Teric jika Anda ingin memakainya setiap hari. Pilih Perdix jika penyelaman Anda melewati 40m atau termasuk dekompresi.</p>",
     "Mike Thompson", "gear_comparisons", False),

    # ---- Training ----
    ("Training", "Tips",
     "improve-buoyancy-control-five-drills",
     "Improve Your Buoyancy Control with These Five Drills",
     "Tingkatkan Kontrol Apung Anda dengan Lima Latihan Ini",
     "Hover like a pro and protect the reef with practiced precision",
     "Melayang seperti profesional dan lindungi terumbu karang dengan presisi terlatih",
     "<p>Buoyancy is the hallmark of an experienced diver. Practice these five drills on your next dive to dramatically improve your control.</p><h3>1. The hover</h3><p>Find a sandy patch, settle into neutral buoyancy, cross your fins, and use only your breath to hold position for 60 seconds.</p><h3>2. The fin pivot</h3><p>Tip-toe on your fins and use your inhale/exhale rhythm to rock forward and back without using your hands.</p>",
     "<p>Daya apung adalah ciri penyelam berpengalaman. Latih lima latihan ini pada penyelaman berikutnya untuk meningkatkan kontrol Anda secara dramatis.</p><h3>1. Hover</h3><p>Cari tempat berpasir, atur daya apung netral, silangkan sirip Anda, dan gunakan hanya napas untuk menahan posisi selama 60 detik.</p><h3>2. Fin pivot</h3><p>Berjinjit di atas sirip dan gunakan ritme tarikan/hembusan napas untuk berayun maju dan mundur tanpa menggunakan tangan.</p>",
     "Captain John Davis", "training_tips", False),

    # ---- Photography ----
    ("Photography", "Gear",
     "best-underwater-strobes-2026",
     "Best Underwater Strobes for 2026",
     "Strobo Bawah Air Terbaik untuk 2026",
     "From entry-level Sea&Sea YS-D3s to flagship Inon Z-330s — our top picks",
     "Dari Sea&Sea YS-D3 untuk pemula hingga Inon Z-330 unggulan — pilihan teratas kami",
     "<p>Choosing the right strobe transforms your underwater images. We tested seven popular models on macro and wide-angle shoots.</p><h3>Best overall: Inon Z-330</h3><p>Powerful, fast-recycling, and reliable. The Z-330 remains the go-to choice for serious shooters in 2026.</p><h3>Best value: Sea&Sea YS-D3</h3><p>Excellent color temperature and beam quality at a price that won't make you flinch on the boat ladder.</p>",
     "<p>Memilih strobo yang tepat akan mengubah gambar bawah air Anda. Kami menguji tujuh model populer pada pemotretan makro dan sudut lebar.</p><h3>Terbaik secara keseluruhan: Inon Z-330</h3><p>Kuat, cepat mendaur ulang, dan andal. Z-330 tetap menjadi pilihan utama bagi penembak serius pada tahun 2026.</p><h3>Nilai terbaik: Sea&Sea YS-D3</h3><p>Suhu warna dan kualitas berkas yang sangat baik dengan harga yang tidak akan membuat Anda merasa bersalah saat di tangga perahu.</p>",
     "Emma Rodriguez", "photography_gear", False),

    # ---- Community ----
    ("Community", "Stories",
     "diving-blind-meet-erik-weihenmayer",
     "Diving Blind: Meet the Diver Who Sees with His Hands",
     "Menyelam Tanpa Penglihatan: Bertemu Penyelam yang Melihat dengan Tangannya",
     "An inspiring story of resilience, adaptation, and the freedom of the underwater world",
     "Kisah inspiratif tentang ketahanan, adaptasi, dan kebebasan dunia bawah laut",
     "<p>For most divers, eyes do the work. For Erik, who lost his sight at 13, every dive is a tactile symphony of currents, textures, and sound.</p><h3>Finding the water</h3><p>Erik took up scuba at 22 and now leads dive trips for the visually impaired across Indonesia and the Maldives.</p>",
     "<p>Bagi sebagian besar penyelam, mata yang melakukan pekerjaan. Bagi Erik, yang kehilangan penglihatannya pada usia 13 tahun, setiap penyelaman adalah simfoni taktil dari arus, tekstur, dan suara.</p><h3>Menemukan air</h3><p>Erik mulai menyelam pada usia 22 tahun dan kini memimpin perjalanan menyelam untuk tunanetra di Indonesia dan Maladewa.</p>",
     "Ana Lopez", "community_stories", True),

    ("Community", "Interviews",
     "interview-with-marine-biologist-dr-sylvia",
     "Interview: Dr. Sylvia Earle on Saving Our Blue Planet",
     "Wawancara: Dr. Sylvia Earle tentang Menyelamatkan Planet Biru Kita",
     "The legendary oceanographer on Hope Spots, plastic pollution, and the next generation of stewards",
     "Oseanografer legendaris tentang Hope Spots, polusi plastik, dan generasi penjaga laut berikutnya",
     "<p>Few people have logged more underwater hours than Dr. Sylvia Earle. We caught up with the 89-year-old explorer aboard her latest expedition.</p><h3>On hope</h3><p>'No water, no life. No blue, no green,' she reminds us — but emphasizes that scientific breakthroughs and a new wave of young activists give her real hope for the next decade.</p>",
     "<p>Sedikit orang yang telah mencatat lebih banyak jam di bawah air daripada Dr. Sylvia Earle. Kami berbincang dengan penjelajah berusia 89 tahun ini di atas ekspedisi terbarunya.</p><h3>Tentang harapan</h3><p>'Tidak ada air, tidak ada kehidupan. Tidak ada biru, tidak ada hijau,' ia mengingatkan kami — tetapi menekankan bahwa terobosan ilmiah dan gelombang aktivis muda baru memberinya harapan nyata untuk dekade berikutnya.</p>",
     "Maya Patel", "community_interviews", False),
]


async def seed():
    mongo_url = os.environ['MONGO_URL']
    db_name = os.environ['DB_NAME']
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]

    # Pre-download all images first
    print("Downloading images...")
    image_urls = {
        key: download_image(key, src) for key, src in IMAGE_SOURCES.items()
    }

    inserted = 0
    skipped = 0
    now = datetime.now(timezone.utc)

    for i, (category, subcat, slug, title_en, title_id, sub_en, sub_id,
            body_en, body_id, author, img_key, featured) in enumerate(SAMPLES):
        existing = await db.articles.find_one({"slug": slug}, {"_id": 1})
        if existing:
            skipped += 1
            print(f"  - Skipped (exists): {slug}")
            continue

        # Stagger created_at so listings look natural
        created = now - timedelta(hours=i * 2)
        doc = {
            "id": str(uuid.uuid4()),
            "title": title_en,
            "title_id": title_id,
            "h2_subtitle": sub_en,
            "h2_subtitle_id": sub_id,
            "content_html": body_en,
            "content_html_id": body_id,
            "category": category,
            "subcategory": subcat,
            "author_name": author,
            "slug": slug,
            "featured": featured,
            "status": "published",
            "language": "en",
            "seo_title": title_en,
            "seo_description": sub_en,
            "seo_keywords": f"{category.lower()}, {subcat.lower()}, scuba diving",
            "featured_image": image_urls[img_key],
            "related_articles": [],
            "created_at": created.isoformat(),
            "updated_at": created.isoformat(),
        }
        await db.articles.insert_one(doc)
        inserted += 1
        print(f"  + Inserted [{category}/{subcat}] {title_en}")

    print(f"\n✓ Seed complete. Inserted: {inserted}, Skipped: {skipped}")
    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
