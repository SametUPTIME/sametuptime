# SametUPTİME nedir?
SametUPTİME resmi discord uptime botumuzdur. Açık kaynaklı kod yapmam amacı kendinize discord uptime bot yapmak, 7/24 aktif etmek olacaktır. 

# Ne yapmalıyım?
1. Önce "code" kısmına basıp daha sonra "download ZIP" yazısına basıyoruz.
2. Ardından zip dosyasını ayıklayıp Visual Studio Code'a geliyoruz. 
Sonra index.js'ye gidip "mongodb_url_niz" yerine kendi mongodb url'nizi alıp yapıştırın (önce https://mongodb.com adresine girip kayıt olmanız ve veritabanı oluşturmanız ardından "şebeke" ya da "network" kısmında "add İP" seçeneğe basın ve "allow access everywhere" tuşuna basmanız, kullanıcı hesap oluşturup sonra url almanız şart) ve <password> yerine mongodb kullanıcı'nın (yani veitaban kullanıcısının) şifresini yapmanız şart (ama önce "allow read & write" izni aktif olmanız gerekmektedir).
3. Daha sonra "veritaban_ismi" yerine kendi veritabanı ismini yazmak gerekmektedir. "birinci_discord_sunucu_id" yerine kendi discord sunucu id'nizi yapıştırın (ikinci discord sunucu id isteğe bağlı), daha sonrası ise "birinci_discord_rol_id" yerine sizin az önceki adımın rol id versiyonu yapıştırın (ikinci discord rol id isteğe bağlı).
4. "process.env.token" kısmını (eğer bilgisayarla hostlayacaksanız, silin) kalsın. Daha sonra "CTRL + S" tuşuna basın.
5. https://gitlab.com 'a girip hesap açarak yeni grup ve proje ismi oluşturun (ama özel (private) mod kalsın, birden çalarlar)
6. Daha sonra "upload" kısmına gelip "index.js" dosyayı bulup daha sonra ya sürükleyin ya da seçip "ok" tuşuna basın. Daha sonra "Upload File" kısmına basıp "package.json' dosyayı aynı adımı takip edin.
7. https://dashboard.render.com/register sitesine gidip kayıt olun. Daha sonra gönderdiği e-posta kutunuza bulup daha sonra linke basın.
8. Daha sonra https://discord.com/developers adresine gidip discord hesaba giriş yapın (hesabınız yoksa, kayıt olun), "New application" kısmına gidip bot isminiz verin.
9. Daha sonra "bot" veya "app" kısmına gidip "Reset Token" kısmına basın (iki aşamalı doğrulama kodu isterse, girin). Bot tokeniniz resetlemiş olur.
10. Daha sonra render'den gelip "New" kısmına gidin ve "web server" tuşuna basın ve ardından gitlab hesabınızı bağlayıp proje ismini bulun ve üstüne basın ve ardından "connect" tuşuna basın.
11. Aşağıya gidip "Free" seçeneği seçin ve tekrardan aşağıya gidip "Environment Variables" kısmını gördüyseniz, bot tokenizi kopyalayın.
12. Tekrar gelip value kısmına yapıştırın. Name kısmında "token" yazınız.
13. Ardından "Deploy web service" tuşuna basınız ve bir kaç dakika sonra discord botunuz aktif olur.

# Uptime nasıl yapılır? 
Uptimerobot, betterstack sitelerden kayıt olup link ekleyerek 7/24 aktif tutturma imkanı var. 

# Peki express paketi ile 7/24 aktif tutar mı?
Evet. Express paketi ile 7/24 aktif tutturma imkanı var. Uptime websitelerden eklerseniz, botunuz sorunsuz şekilde aktif tutturabilir. 

Render'den başka hosting websitesi önerir misin?

Evet. Tek alternatifi Glitch. Replit artık eskisi gibi aktif tutturma imkanı sunmuyor ve bot offline olma ihtimali çok yüksektir.











© SametUPTİME. Tüm hakları saklıdır!
























