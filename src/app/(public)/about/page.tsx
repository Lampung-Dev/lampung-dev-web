import { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/next-auth";

export const metadata: Metadata = {
  title: "About",
};

export default async function About() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }
  return (
    <div>
      <div className="p-8 prose bg-green-600/10 backdrop-blur-sm border-white border rounded-xl">
        <p className="text-2xl font-bold mb-4 text-primary">
          Visi Komunitas Lampung Developer
        </p>
        <ul className="space-y-4 text-justify">
          <li>
            1. Menjadi komunitas teknologi terdepan di Lampung yang mendorong
            inovasi, kolaborasi, dan pertumbuhan ekosistem digital. Lampung
            Developer ingin menjadi komunitas teknologi yang paling maju dan
            berpengaruh di Lampung. Komunitas ini berperan sebagai tempat
            berkembangnya ide-ide baru, kerjasama antar penggiat teknologi,
            serta mendukung perkembangan dunia digital di daerah.
          </li>
          <li>
            2. Menciptakan lingkungan pembelajaran yang inklusif bagi semua
            kalangan, baik pemula maupun profesional, dalam dunia pengembangan
            teknologi. Lampung Developer akan membangun suasana belajar yang
            terbuka untuk semua orang, mulai dari yang baru belajar teknologi
            hingga yang sudah ahli. Semua orang bisa belajar dan berkembang
            bersama di komunitas ini.
          </li>
          <li>
            3. Menghubungkan developer lokal dengan peluang global melalui
            edukasi, networking, dan dukungan teknologi mutakhir. Lampung
            Developer berusaha membantu para pengembang teknologi (developer) di
            Lampung agar bisa terhubung dengan kesempatan-kesempatan di luar
            negeri. Caranya melalui kegiatan belajar, bertemu dengan orang-orang
            baru, dan menggunakan teknologi terbaru.
          </li>
          <li>
            4. Menginspirasi generasi muda Lampung untuk menjadi bagian dari
            revolusi teknologi global. Lampung Developer ingin memotivasi
            anak-anak muda di Lampung untuk ikut serta dalam perubahan besar di
            bidang teknologi dunia. Lampung Developer berperan dalam membuka
            mata generasi muda tentang pentingnya teknologi di masa depan.
          </li>
          <li>
            5. Memperkuat posisi Lampung sebagai pusat pengembangan teknologi
            kreatif dan inovatif di Indonesia. Lampung Developer bercita-cita
            untuk menjadikan Lampung sebagai salah satu daerah unggulan di
            Indonesia dalam hal teknologi. Komunitas ini ingin membuat Lampung
            dikenal sebagai tempat di mana kreativitas dan inovasi teknologi
            tumbuh dan berkembang. Mari wujudkan visi ini bersama untuk
            menjadikan Lampung pusat pengembangan teknologi kreatif di
            Indonesia.
          </li>
        </ul>
      </div>

      <div className="p-8 prose bg-green-600/10 backdrop-blur-sm border-white border rounded-xl mt-4">
        <p className="text-2xl font-bold mb-4 text-primary">
          Misi Komunitas Lampung Developer
        </p>
        <ul className="space-y-4 text-justify">
          <li>
            1. Menyelenggarakan pelatihan rutin dan workshop gratis untuk
            meningkatkan keterampilan teknis para anggota komunitas.
          </li>
          <li>
            2. Mengadakan hackathon dan kompetisi coding tahunan untuk mendorong
            kreativitas dan inovasi di bidang pengembangan perangkat lunak.
          </li>
          <li>
            3. Membangun kolaborasi dengan perusahaan, startup, dan institusi
            pendidikan untuk menciptakan ekosistem teknologi yang solid di
            Lampung.
          </li>
          <li>
            4. Memfasilitasi program mentorship antara developer senior dan
            junior untuk mempercepat pengembangan kemampuan individu.
          </li>
          <li>
            5. Mengembangkan platform digital komunitas sebagai pusat informasi,
            berbagi pengetahuan, dan proyek kolaboratif.
          </li>
          <li>
            6. Meningkatkan kesadaran masyarakat Lampung tentang pentingnya
            teknologi dalam berbagai sektor melalui seminar dan acara publik.
          </li>
          <li>
            7. Menciptakan ruang kerja bersama (co-working space) yang mendukung
            kegiatan kolaborasi antar anggota komunitas.
          </li>
          <li>
            8. Membangun jaringan dengan komunitas teknologi lainnya di
            Indonesia untuk memperluas wawasan dan memperkuat koneksi.
          </li>
          <li>
            9. Mendukung startup lokal melalui program inkubasi dan bimbingan
            teknologi.
          </li>
          <li>
            10. Bekerja sama dengan pemerintah daerah untuk mempercepat
            penggunaan teknologi di Lampung dan mempermudah layanan masyarakat.
          </li>
          <p>
            Sebagai komunitas, kita percaya bahwa kolaborasi, pendidikan, dan
            inovasi adalah kunci untuk membangun masa depan teknologi yang lebih
            baik di Lampung. Dengan semangat kebersamaan dan dukungan satu sama
            lain, kita akan terus berkembang dan berkontribusi untuk kemajuan
            bersama. Melalui misi ini, kita tidak hanya membangun teknologi,
            tetapi juga membangun masa depan yang lebih cerah bagi masyarakat.
            Mari kita terus bergerak maju, bersinergi, dan menjadi bagian dari
            perubahan positif di Lampung.
          </p>
        </ul>
      </div>
    </div>
  );
}
