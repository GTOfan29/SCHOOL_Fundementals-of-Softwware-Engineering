Projenin Çalışması İçin Gereken Adımlar:

-Öncelikle PostgreSql database'inin kurulması lazım: "restaurant-database backup.sql"  dosyası ile
 "restaurant_system" isminde database kurulması lazım
- backend klasöründeki .env dosyasındaki bilgilerin kurulan bilgisayar için ayarlanması gerekiyor
-kullanılan portlar 3000 ve 3001

-Database kurulduktan sonra projeyi başlatmak için:
	-backendi database'e bağlamak için backend klasöründe powershell/terminal'de 'npm run dev'
	-frontendi başlatmak için frontend klasöründe powershell/terminal'de 'npm start'

http://localhost:3000/        	: müşteri sayfası
http://localhost:3000/kitchen 	: mutfak ekranı
http://localhost:3000/server    : kasa ekranı
http://localhost:3000/admin     : admin sayfası


modüllerle ilgili bir hata durumunda 'npm install' sorunları çözebilir. 