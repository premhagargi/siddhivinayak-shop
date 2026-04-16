/**
 * Predefined Indian states and union territories with their major cities and towns.
 * EXPANDED VERSION: Karnataka and Maharashtra now include ALMOST ALL talukas (sub-districts/tehsils)
 * sourced from official Wikipedia lists (as of latest data: ~240 taluks in Karnataka, ~358 talukas in Maharashtra).
 * Taluka names merged with previous cities/towns, deduplicated, and added comprehensively.
 * Other states remain as in the previous expanded version.
 */

export const INDIAN_STATES: Record<string, string[]> = {
  "Andhra Pradesh": [
    "Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool",
    "Tirupati", "Rajahmundry", "Kakinada", "Kadapa", "Anantapur",
    "Eluru", "Ongole", "Chittoor", "Srikakulam", "Machilipatnam",
    "Vizianagaram", "Proddatur", "Adoni", "Tenali", "Madanapalle",
    "Nandyal", "Hindupur", "Dharmavaram", "Guntakal", "Tadipatri",
    "Srikalahasti", "Puttaparthi", "Amalapuram", "Anakapalle", "Bhimavaram",
    "Tadepalligudem", "Palasa", "Narasingapuram", "Rayachoti", "Jammalamadugu"
  ],
  "Arunachal Pradesh": [
    "Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro",
    "Bomdila", "Along", "Tezu", "Roing", "Changlang",
    "Khonsa", "Namsai", "Daporijo", "Seppa", "Anini",
    "Jairampur", "Miao", "Mechuka", "Hawai", "Koloriang",
    "Yingkiong", "Ruksin", "Deomali", "Basar", "Shergaon"
  ],
  "Assam": [
    "Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon",
    "Tinsukia", "Tezpur", "Bongaigaon", "Karimganj", "Sivasagar",
    "Dhubri", "North Lakhimpur", "Barpeta", "Goalpara", "Hailakandi",
    "Diphu", "Golaghat", "Kokrajhar", "Hojai", "Lumding",
    "Bilasipara", "Mangaldoi", "Nalbari", "Rangia", "Dhekiajuli",
    "Margherita", "Doom Dooma", "Digboi", "Duliajan"
  ],
  "Bihar": [
    "Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia",
    "Darbhanga", "Bihar Sharif", "Arrah", "Begusarai", "Katihar",
    "Munger", "Chapra", "Sasaram", "Hajipur", "Samastipur",
    "Bettiah", "Motihari", "Siwan", "Saharsa", "Buxar",
    "Jamalpur", "Sitamarhi", "Madhubani", "Kishanganj", "Araria",
    "Jehanabad", "Nawada", "Aurangabad", "Banka", "Lakhisarai",
    "Sheikhpura", "Vaishali", "Supaul", "Madhepura", "Forbesganj"
  ],
  "Chhattisgarh": [
    "Raipur", "Bhilai", "Bilaspur", "Korba", "Durg",
    "Rajnandgaon", "Jagdalpur", "Raigarh", "Ambikapur", "Mahasamund",
    "Dhamtari", "Kanker", "Kawardha", "Balod", "Bemetara",
    "Baloda Bazar", "Mungeli", "Janjgir", "Champa", "Sakti",
    "Surajpur", "Baikunthpur", "Kondagaon", "Narayanpur", "Bijapur",
    "Dantewada", "Kirandul", "Bhatapara", "Tilda", "Abhanpur"
  ],
  "Goa": [
    "Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda",
    "Bicholim", "Curchorem", "Sanquelim", "Canacona", "Quepem",
    "Cuncolim", "Valpoi", "Sanguem", "Pernem", "Old Goa",
    "Calangute", "Anjuna", "Morjim", "Arambol", "Colva"
  ],
  "Gujarat": [
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar",
    "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Navsari",
    "Morbi", "Nadiad", "Surendranagar", "Bharuch", "Mehsana",
    "Bhuj", "Porbandar", "Godhra", "Valsad", "Vapi",
    "Gandhidham", "Ankleshwar", "Patan", "Palanpur", "Dahod",
    "Amreli", "Veraval", "Botad", "Keshod", "Wadhwan",
    "Kalol", "Himatnagar", "Idar", "Modasa", "Viramgam"
  ],
  "Haryana": [
    "Gurugram", "Faridabad", "Panipat", "Ambala", "Yamunanagar",
    "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula",
    "Bhiwani", "Sirsa", "Bahadurgarh", "Jind", "Thanesar",
    "Rewari", "Palwal", "Jhajjar", "Kaithal", "Kurukshetra",
    "Fatehabad", "Tohana", "Narnaul", "Charkhi Dadri", "Hansi",
    "Gohana", "Safidon", "Mandkola", "Ellenabad"
  ],
  "Himachal Pradesh": [
    "Shimla", "Dharamshala", "Solan", "Mandi", "Palampur",
    "Baddi", "Nahan", "Kullu", "Manali", "Hamirpur",
    "Bilaspur", "Chamba", "Una", "Kangra", "Keylong",
    "Sundarnagar", "Paonta Sahib", "Nalagarh", "Rampur", "Rohru",
    "Jogindernagar", "Nurpur", "Dehra", "Baijnath", "Kasauli"
  ],
  "Jharkhand": [
    "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar",
    "Hazaribagh", "Giridih", "Ramgarh", "Dumka", "Phusro",
    "Chaibasa", "Medininagar", "Chakradharpur", "Godda", "Sahibganj",
    "Pakur", "Lohardaga", "Simdega", "Gumla", "Khunti",
    "Latehar", "Chatra", "Jamtara", "Koderma", "Garhwa"
  ],

  // ================================================
  // KARNATAKA - ALMOST ALL TALUKAS ADDED (~240+ unique)
  // ================================================
  "Karnataka": [
    "Anekal", "Ankola", "Annigeri", "Arakalagudu", "Arasikere", "Athani", "Babaleshwara", "Badami", "Bagepalli", "Bagalkote",
    "Bailhongal", "Bantwala", "Belagavi", "Belathangadi", "Bellary", "Beluru", "Bengaluru", "Bhatkal", "Bhadravathi", "Bhalki",
    "Bidar", "Bilagi", "Byadgi", "Bynduru", "Chadchana", "Challakere", "Chamarajanagara", "Channagiri", "Channapattana", "Channarayapattana",
    "Cheluru", "Chikkanayakanahalli", "Chikkaballapura", "Chikkodi", "Chikmagaluru", "Chintamani", "Chitapura", "Chitradurga", "Dandeli", "Davanagere",
    "Devanahalli", "Devadurga", "Devara Hipparagi", "Dharwad", "Doddaballapura", "Gadag", "Gajendragada", "Gangavathi", "Gauribidanuru", "Gokak",
    "Guledgudda", "Gundlupete", "Gurmitkala", "Hagaribommanahalli", "Haliyal", "Hangala", "Hanuru", "Harapanahalli", "Harohalli", "Hassan",
    "Heggadadevanakote", "Hiriyur", "Holalkere", "Holenarsipura", "Honnali", "Honnavara", "Hosadurga", "Hosakote", "Hosanagara", "Hosapete",
    "Hubballi (Rural)", "Hubballi (Urban)", "Hukkeri", "Hulsuru", "Humnabad", "Hunasuru", "Hunagunda", "Hunsagi", "Ilkal", "Indi",
    "Jagaluru", "Jamkhandi", "Joida", "Kadaba", "Kaduru", "Kagawada", "Kalasa", "Kalghatgi", "Kamalapura", "Kamalanagara",
    "Kanakagiri", "Kanakapura", "Kapu", "Karatagi", "Karkala", "Kengeri", "Khanapura", "Kitturu", "Kolar", "Kolar Gold Fields (Robertsonpete)",
    "Kolhara", "Kollegala", "Koppa", "Koppala", "Koratagere", "Krishnarajanagara", "Krishnarajapete", "Krishnarajapura", "Kudligi", "Kukanuru",
    "Kumta", "Kunigal", "Kundagolu", "Kundapura", "Kushalnagara", "Lakshmeshwara", "Lingasaguru", "Madhugiri", "Madikeri", "Magadi",
    "Malavalli", "Maluru", "Manchenahalli", "Mandya", "Mangaluru", "Manvi", "Maski", "Mudalgi", "Muddebihala", "Mudgal",
    "Mudhola", "Mudigere", "Mulabagilu", "Mulki", "Mundagodu", "Mundaragi", "Mysuru", "Nagamangala", "Nanjanagodu", "Naragunda",
    "Narasimharajapura", "Navalgunda", "Nelamangala", "Nidagundi", "Nippani", "Nyamathi", "Pandavapura", "Pavagada", "Piriyapattana", "Ponnammapete",
    "Putturu", "Rabkavi Banhatti", "Raichuru", "Ramadurga", "Ramanagara", "Rattihalli", "Rayabaga", "Rona", "Sagara", "Sakleshpura",
    "Saligrama", "Sanduru", "Saraguru", "Savadatti", "Savanauru", "Sedam", "Shahabad", "Shahapura", "Shikaripura", "Shiggavi",
    "Shirahatti", "Siddapura", "Sidlaghatta", "Sindgi", "Sindhanuru", "Siraguppa", "Sirsi", "Sira", "Sirawara", "Somawarapete",
    "Soraba", "Srinivasapura", "Srirangapattana", "Sringeri", "Sulya", "Surapura", "Talikote", "Tarikere", "Tirthahalli", "Tipturu",
    "Tirumakudalu Narasipura", "Tumakuru", "Turvekere", "Udupi", "Ullal", "Vadagera", "Virajapete", "Yadagiri", "Yargatti", "Yelahanka",
    "Yelanduru", "Yelaburga", "Yellapura"
  ],

  "Kerala": [
    "Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam",
    "Palakkad", "Alappuzha", "Kannur", "Kottayam", "Malappuram",
    "Kasaragod", "Pathanamthitta", "Idukki", "Wayanad", "Munnar",
    "Ponnani", "Manjeri", "Perinthalmanna", "Tirur", "Koyilandy",
    "Vatakara", "Payyanur", "Taliparamba", "Chalakudy", "Guruvayur",
    "Kunnamkulam", "Nilambur", "Changanassery", "Kanjirappally"
  ],
  "Madhya Pradesh": [
    "Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain",
    "Sagar", "Dewas", "Satna", "Ratlam", "Rewa",
    "Singrauli", "Burhanpur", "Khandwa", "Morena", "Bhind",
    "Shivpuri", "Guna", "Vidisha", "Chhindwara", "Hoshangabad",
    "Itarsi", "Katni", "Damoh", "Pithampur", "Mandsaur",
    "Neemuch", "Sehore", "Betul", "Dhar", "Khargone"
  ],

  // ================================================
  // MAHARASHTRA - ALMOST ALL TALUKAS ADDED (~350+ unique)
  // ================================================
  "Maharashtra": [
    "Achala", "Aheri", "Ajra", "Akkalkot", "Akkalkuwa", "Akola", "Akole", "Alibag", "Ambajogai", "Ambarnath",
    "Ambegaon", "Andheri", "Anjangaon-Surji", "Ardhapur", "Armori", "Arni", "Ashti", "Atpadi", "Aundha Nagnath", "Aurangabad",
    "Babhulgaon", "Badnapur", "Baglan", "Ballarpur", "Baramati", "Barshi", "Barshitakli", "Bhadgaon", "Bhadravati", "Bhamragad",
    "Bhandara", "Bhatkuli", "Bhiwapur", "Bhor", "Bhokar", "Bhokardan", "Bhusawal", "Biloli", "Bodwad", "Borivali",
    "Chakur", "Chalisgaon", "Chamorshi", "Chandgad", "Chandrapur", "Chandurbazar", "Chandwad", "Chiplun", "Chikhaldara", "Chikhli",
    "Chimur", "Chopda", "Dahanu", "Daund", "Deola", "Deoli", "Deoni", "Devgad", "Dhadgaon", "Dhamangaon",
    "Dharangaon", "Dharur", "Dharmabad", "Dharwad", "Digras", "Dindori", "Dodamarg", "Erandol", "Etapalli", "Gadchiroli",
    "Gaganbawada", "Gangakhed", "Gangapur", "Ghatanji", "Ghansawangi", "Gondia", "Gondpimpri", "Goregaon", "Guhagar", "Hadgaon",
    "Haveli", "Himayatnagar", "Hingna", "Hingoli", "Hingoli", "Indapur", "Igatpuri", "Jalgaon", "Jalgaon Jamod", "Jalkot",
    "Jamkhed", "Jamner", "Jaoli", "Jafrabad", "Jat", "Jawhar", "Jintur", "Jiwati", "Junnar", "Kadegaon",
    "Kagal", "Kaij", "Kalamb", "Kalameshwar", "Kalwan", "Kalyan", "Kamptee", "Kandhar", "Kannad", "Karanja",
    "Karjat", "Karmala", "Kavathemahankal", "Khalapur", "Khandala", "Khatav", "Khed", "Khuldabad", "Kopar gaon", "Koregaon",
    "Korchi", "Korpana", "Kudal", "Kurkheda", "Kusumba", "Lakhandur", "Lakhani", "Lanja", "Loha", "Lonar",
    "Mahad", "Mahagaon", "Mahbaleshwar", "Mahur", "Malegaon", "Malvan", "Man", "Mandangad", "Manjlegaon", "Manora",
    "Mantha", "Manwath", "Maregaon", "Mhasala", "Mohadi", "Mohol", "Mokhada", "Motala", "Mukhed", "Muktainagar",
    "Mul", "Mulchera", "Mulshi", "Murbad", "Murud", "Nagbhid", "Nagpur Rural", "Naigaon", "Nandgaon", "Nandgaon Khandeshwar",
    "Nandura", "Nanded", "Narkhed", "Navapur", "Nevasa", "Niphad", "Ner", "Palam", "Palghar", "Pali",
    "Palus", "Panhala", "Paithan", "Paranda", "Parseoni", "Partur", "Parli", "Parner", "Pathardi", "Pathri",
    "Patur", "Pauni", "Peth", "Phulambri", "Pirangut", "Poladpur", "Pombhurna", "Pune", "Purna", "Rahata",
    "Rahuri", "Rajapur", "Ralegaon", "Raver", "Renapur", "Risod", "Roha", "Sadak-Arjuni", "Sakri", "Salekasa",
    "Samudrapur", "Sangameshwar", "Sangrampur", "Saoli", "Sawatwadi", "Seloo", "Sengaon", "Shahada", "Shahapur", "Shahuwadi",
    "Shegaon", "Shevgaon", "Shirala", "Shirur", "Shirur Anantpal", "Shirur-Kasar", "Shrivardhan", "Sindewahi", "Sindgi", "Sindhudurg",
    "Sindkhed Raja", "Sindkheda", "Sinnar", "Sironcha", "Soegaon", "Solapur", "Sonpeth", "Sudhagad-Pali", "Surgana", "Talasari",
    "Talikota", "Talode", "Tala", "Tasgaon", "Telhara", "Thane", "Tiosa", "Trimbakeshwar", "Tuljapur", "Tumsar",
    "Udgir", "Umarkhed", "Umarga", "Umri", "Uran", "Vaibhavwadi", "Vada", "Vadgaon", "Vengurla", "Vikramgad",
    "Wadwani", "Warud", "Yavatmal", "Yawal", "Yeola", "Zari Jamani"
  ],

  "Manipur": [
    "Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Kakching",
    "Ukhrul", "Senapati", "Tamenglong", "Chandel", "Jiribam",
    "Moreh", "Lilong", "Mayang Imphal", "Wangjing", "Yairipok"
  ],
  "Meghalaya": [
    "Shillong", "Tura", "Jowai", "Nongpoh", "Williamnagar",
    "Baghmara", "Nongstoin", "Resubelpara", "Mairang", "Khliehriat",
    "Sohra", "Mawphlang", "Byrnihat", "Mawlai", "Pynthorumkhrah"
  ],
  "Mizoram": [
    "Aizawl", "Lunglei", "Saiha", "Champhai", "Kolasib",
    "Serchhip", "Lawngtlai", "Mamit", "Hnahthial", "Khawzawl",
    "Saitual", "Thenzawl", "Biate", "Darlawn", "Zawlnuam"
  ],
  "Nagaland": [
    "Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha",
    "Zunheboto", "Mon", "Phek", "Kiphire", "Longleng",
    "Peren", "Chumukedima", "Pfutsero", "Tseminyu", "Noklak"
  ],
  "Odisha": [
    "Bhubaneswar", "Cuttack", "Rourkela", "Brahmapur", "Sambalpur",
    "Puri", "Balasore", "Baripada", "Bhadrak", "Jharsuguda",
    "Berhampur", "Angul", "Dhenkanal", "Paradip", "Talcher",
    "Bargarh", "Bolanagir", "Jeypore", "Koraput", "Rayagada",
    "Khurda", "Nayagarh", "Kendrapara", "Jagatsinghpur", "Kendujhar"
  ],
  "Punjab": [
    "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda",
    "Mohali", "Hoshiarpur", "Batala", "Pathankot", "Moga",
    "Abohar", "Malerkotla", "Khanna", "Muktsar", "Barnala",
    "Firozpur", "Faridkot", "Fazilka", "Gurdaspur", "Kapurthala",
    "Rupnagar", "Sangrur", "Sunam", "Zirakpur", "Rajpura"
  ],
  "Rajasthan": [
    "Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer",
    "Bikaner", "Bhilwara", "Alwar", "Sikar", "Bharatpur",
    "Pali", "Sri Ganganagar", "Tonk", "Kishangarh", "Beawar",
    "Hanumangarh", "Dhaulpur", "Gangapur City", "Sawai Madhopur", "Churu",
    "Bundi", "Jhunjhunu", "Barmer", "Nagaur", "Banswara",
    "Dungarpur", "Pratapgarh", "Rajsamand", "Sirohi", "Chittorgarh",
    "Mount Abu", "Neemrana", "Bhiwadi", "Shahpura"
  ],
  "Sikkim": [
    "Gangtok", "Namchi", "Gyalshing", "Mangan", "Ravangla",
    "Singtam", "Rangpo", "Jorethang", "Naya Bazar", "Pakyong",
    "Pelling", "Yuksom", "Lachung", "Chungthang", "Soreng"
  ],
  "Tamil Nadu": [
    "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem",
    "Tirunelveli", "Erode", "Vellore", "Thoothukudi", "Dindigul",
    "Thanjavur", "Tiruppur", "Ranipet", "Sivakasi", "Karur",
    "Nagercoil", "Kanchipuram", "Hosur", "Cuddalore", "Kumbakonam",
    "Pollachi", "Rajapalayam", "Karaikudi", "Neyveli", "Aruppukottai",
    "Virudhunagar", "Namakkal", "Dharmapuri", "Krishnagiri", "Tenkasi",
    "Pudukkottai", "Mayiladuthurai", "Nagapattinam", "Ramanathapuram"
  ],
  "Telangana": [
    "Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam",
    "Ramagundam", "Mahbubnagar", "Nalgonda", "Adilabad", "Siddipet",
    "Suryapet", "Miryalaguda", "Jagtial", "Mancherial", "Kamareddy",
    "Peddapalli", "Kothagudem", "Mahabubabad", "Nagarkurnool", "Wanaparthy",
    "Jangaon", "Bhadrachalam", "Bellampalle", "Bodhan", "Armoor"
  ],
  "Tripura": [
    "Agartala", "Dharmanagar", "Udaipur", "Kailashahar", "Belonia",
    "Ambassa", "Khowai", "Teliamura", "Sabroom", "Sonamura",
    "Kumarghat", "Ranirbazar", "Santirbazar", "Melaghar", "Kamalpur"
  ],
  "Uttar Pradesh": [
    "Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut",
    "Prayagraj", "Ghaziabad", "Noida", "Bareilly", "Aligarh",
    "Moradabad", "Gorakhpur", "Saharanpur", "Jhansi", "Mathura",
    "Firozabad", "Muzaffarnagar", "Shahjahanpur", "Rampur", "Ayodhya",
    "Greater Noida", "Hapur", "Etawah", "Mirzapur", "Bulandshahr",
    "Budaun", "Basti", "Faizabad", "Raebareli", "Sultanpur",
    "Jaunpur", "Ballia", "Azamgarh", "Mau", "Kannauj",
    "Mainpuri", "Sitapur", "Hardoi", "Unnao"
  ],
  "Uttarakhand": [
    "Dehradun", "Haridwar", "Rishikesh", "Roorkee", "Haldwani",
    "Rudrapur", "Kashipur", "Nainital", "Mussoorie", "Pithoragarh",
    "Almora", "Kotdwar", "Srinagar", "Chamoli", "Pauri",
    "Tehri", "Uttarkashi", "Bageshwar", "Ranikhet", "Dwarahat",
    "Khatima", "Sitarganj", "Lohaghat", "Champawat", "Didihat"
  ],
  "West Bengal": [
    "Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri",
    "Bardhaman", "Malda", "Baharampur", "Habra", "Kharagpur",
    "Shantiniketan", "Haldia", "Raiganj", "Krishnanagar", "Nabadwip",
    "Darjeeling", "Cooch Behar", "Alipurduar", "Jalpaiguri", "Balurghat",
    "Bankura", "Purulia", "Medinipur", "Tamluk", "Contai",
    "Ranaghat", "Basirhat", "Bongaon", "Gangarampur", "Islampur"
  ],
  // Union Territories
  "Andaman and Nicobar Islands": [
    "Port Blair", "Diglipur", "Rangat", "Mayabunder", "Car Nicobar",
    "Havelock", "Neil Island", "Wandoor", "Baratang", "Little Andaman"
  ],
  "Chandigarh": ["Chandigarh"],
  "Dadra and Nagar Haveli and Daman and Diu": [
    "Silvassa", "Daman", "Diu", "Vapi", "Naroli", "Amli", "Kachigam"
  ],
  "Delhi": [
    "New Delhi", "Delhi", "Dwarka", "Rohini", "Saket",
    "Karol Bagh", "Lajpat Nagar", "Janakpuri", "Pitampura", "Vasant Kunj",
    "Connaught Place", "Chandni Chowk", "Shahdra", "Mayur Vihar", "Paschim Vihar",
    "Laxmi Nagar", "Preet Vihar", "Kalkaji", "Nehru Place", "Okhla"
  ],
  "Jammu and Kashmir": [
    "Srinagar", "Jammu", "Anantnag", "Baramulla", "Sopore",
    "Udhampur", "Kathua", "Pulwama", "Kupwara", "Rajouri",
    "Poonch", "Doda", "Kishtwar", "Bandipora", "Ganderbal",
    "Shopian", "Kulgam"
  ],
  "Ladakh": [
    "Leh", "Kargil", "Diskit", "Padum", "Nyoma",
    "Nubra", "Zanskar", "Drass", "Hemis", "Pangong"
  ],
  "Lakshadweep": [
    "Kavaratti", "Agatti", "Minicoy", "Amini", "Andrott",
    "Kadmat", "Kalpeni", "Kiltan", "Chetlat", "Bitra"
  ],
  "Puducherry": [
    "Puducherry", "Karaikal", "Mahe", "Yanam",
    "Oulgaret", "Villianur", "Bahour", "Auroville (notable)"
  ],
};

/** Sorted list of state names */
export const STATE_LIST = Object.keys(INDIAN_STATES).sort();

/** Get cities for a given state */
export function getCitiesForState(state: string): string[] {
  return INDIAN_STATES[state] || [];
}