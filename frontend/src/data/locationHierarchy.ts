export interface CityTown {
  id: string;
  name: string;
  isOperational: boolean;
  coordinates?: [number, number];
}

export interface DistrictInfo {
  id: string;
  name: string;
  isOperational: boolean;
  coordinates: [number, number];
  cities: CityTown[];
}

export interface StateInfo {
  id: string;
  name: string;
  code: string;
  isUt?: boolean;
  isOperational: boolean;
  coordinates: [number, number];
  districts: DistrictInfo[];
}

export interface CountryInfo {
  id: string;
  name: string;
  code: string;
  states: StateInfo[];
}

export interface SearchableLocation {
  label: string;
  name: string;
  type: 'country' | 'state' | 'district' | 'city';
  country: string;
  state: string;
  district: string;
  city: string;
  coordinates: [number, number];
  isOperational: boolean;
  level: number;
}

export const INDIA_LOCATION_DATA: CountryInfo = {
  id: 'india',
  name: 'India',
  code: 'IN',
  states: [
    // ═════════════════════════════════════════════════════════════════════════
    // 1. TAMIL NADU (Primary Operational State - All 38 Districts)
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'tamil_nadu',
      name: 'Tamil Nadu',
      code: 'TN',
      isOperational: true,
      coordinates: [11.1271, 78.6569],
      districts: [
        {
          id: 'chennai',
          name: 'Chennai',
          isOperational: true,
          coordinates: [13.0827, 80.2707],
          cities: [
            { id: 'perambur', name: 'Perambur', isOperational: true, coordinates: [13.1110, 80.2420] },
            { id: 'zone-6', name: 'Zone VI – Thiru-Vi-Ka Nagar', isOperational: true, coordinates: [13.1110, 80.2420] },
            { id: 'anna_nagar', name: 'Anna Nagar', isOperational: true, coordinates: [13.0850, 80.2100] },
            { id: 't_nagar', name: 'T. Nagar', isOperational: true, coordinates: [13.0418, 80.2341] },
            { id: 'velachery', name: 'Velachery', isOperational: true, coordinates: [12.9815, 80.2180] },
            { id: 'mylapore', name: 'Mylapore', isOperational: true, coordinates: [13.0330, 80.2690] },
            { id: 'adyar', name: 'Adyar', isOperational: true, coordinates: [13.0012, 80.2565] },
            { id: 'royapuram', name: 'Royapuram', isOperational: true, coordinates: [13.1090, 80.2940] },
            { id: 'tondiarpet', name: 'Tondiarpet', isOperational: true, coordinates: [13.1280, 80.2880] },
            { id: 'ambattur', name: 'Ambattur', isOperational: true, coordinates: [13.1143, 80.1548] },
            { id: 'kodambakkam', name: 'Kodambakkam', isOperational: true, coordinates: [13.0520, 80.2250] },
            { id: 'alandur', name: 'Alandur', isOperational: true, coordinates: [13.0030, 80.2010] },
            { id: 'perungudi', name: 'Perungudi', isOperational: true, coordinates: [12.9650, 80.2430] },
            { id: 'sholinganallur', name: 'Sholinganallur', isOperational: true, coordinates: [12.8990, 80.2280] },
            { id: 'thiruvottiyur', name: 'Thiruvottiyur', isOperational: true, coordinates: [13.1610, 80.3010] },
            { id: 'madhavaram', name: 'Madhavaram', isOperational: true, coordinates: [13.1480, 80.2310] },
            { id: 'manali', name: 'Manali', isOperational: true, coordinates: [13.1720, 80.2610] },
            { id: 'valasaravakkam', name: 'Valasaravakkam', isOperational: true, coordinates: [13.0410, 80.1740] },
            { id: 'chennai_city', name: 'Greater Chennai Corporation (All)', isOperational: true, coordinates: [13.0827, 80.2707] },
          ],
        },
        {
          id: 'ariyalur',
          name: 'Ariyalur',
          isOperational: false,
          coordinates: [11.14, 79.07],
          cities: [
            { id: 'ariyalur_town', name: 'Ariyalur', isOperational: false, coordinates: [11.14, 79.07] },
            { id: 'jayankondam', name: 'Jayankondam', isOperational: false, coordinates: [11.21, 79.35] },
          ],
        },
        {
          id: 'chengalpattu',
          name: 'Chengalpattu',
          isOperational: false,
          coordinates: [12.68, 79.98],
          cities: [
            { id: 'chengalpattu_town', name: 'Chengalpattu', isOperational: false, coordinates: [12.682, 79.984] },
            { id: 'tambaram', name: 'Tambaram', isOperational: false, coordinates: [12.925, 80.100] },
            { id: 'pallavaram', name: 'Pallavaram', isOperational: false, coordinates: [12.968, 80.149] },
            { id: 'maraimalai_nagar', name: 'Maraimalai Nagar', isOperational: false, coordinates: [12.795, 80.024] },
          ],
        },
        {
          id: 'coimbatore',
          name: 'Coimbatore',
          isOperational: false,
          coordinates: [11.0168, 76.9558],
          cities: [
            { id: 'gandhipuram', name: 'Gandhipuram', isOperational: false, coordinates: [11.018, 76.964] },
            { id: 'rs_puram', name: 'RS Puram', isOperational: false, coordinates: [11.008, 76.948] },
            { id: 'peelamedu', name: 'Peelamedu', isOperational: false, coordinates: [11.028, 77.012] },
            { id: 'coimbatore_city', name: 'Coimbatore City', isOperational: false, coordinates: [11.0168, 76.9558] },
            { id: 'pollachi', name: 'Pollachi', isOperational: false, coordinates: [10.6608, 77.0084] },
            { id: 'mettupalayam', name: 'Mettupalayam', isOperational: false, coordinates: [11.300, 76.950] },
          ],
        },
        {
          id: 'cuddalore',
          name: 'Cuddalore',
          isOperational: false,
          coordinates: [11.75, 79.75],
          cities: [
            { id: 'cuddalore_town', name: 'Cuddalore', isOperational: false },
            { id: 'chidambaram', name: 'Chidambaram', isOperational: false },
            { id: 'panruti', name: 'Panruti', isOperational: false },
            { id: 'neyveli', name: 'Neyveli', isOperational: false },
          ],
        },
        {
          id: 'dharmapuri',
          name: 'Dharmapuri',
          isOperational: false,
          coordinates: [12.13, 78.16],
          cities: [
            { id: 'dharmapuri_town', name: 'Dharmapuri', isOperational: false },
            { id: 'harur', name: 'Harur', isOperational: false },
            { id: 'palacode', name: 'Palacode', isOperational: false },
          ],
        },
        {
          id: 'dindigul',
          name: 'Dindigul',
          isOperational: false,
          coordinates: [10.36, 77.98],
          cities: [
            { id: 'dindigul_town', name: 'Dindigul', isOperational: false },
            { id: 'palani', name: 'Palani', isOperational: false },
            { id: 'kodaikanal', name: 'Kodaikanal', isOperational: false },
          ],
        },
        {
          id: 'erode',
          name: 'Erode',
          isOperational: false,
          coordinates: [11.341, 77.7172],
          cities: [
            { id: 'erode_city', name: 'Erode City', isOperational: false, coordinates: [11.341, 77.7172] },
            { id: 'perundurai', name: 'Perundurai', isOperational: false, coordinates: [11.275, 77.585] },
            { id: 'bhavani', name: 'Bhavani', isOperational: false, coordinates: [11.450, 77.680] },
            { id: 'gobichettipalayam', name: 'Gobichettipalayam', isOperational: false, coordinates: [11.454, 77.442] },
          ],
        },
        {
          id: 'kallakurichi',
          name: 'Kallakurichi',
          isOperational: false,
          coordinates: [11.738, 78.962],
          cities: [
            { id: 'kallakurichi_town', name: 'Kallakurichi', isOperational: false },
            { id: 'ulundurpet', name: 'Ulundurpet', isOperational: false },
            { id: 'sankarapuram', name: 'Sankarapuram', isOperational: false },
          ],
        },
        {
          id: 'kancheepuram',
          name: 'Kancheepuram',
          isOperational: false,
          coordinates: [12.8342, 79.7036],
          cities: [
            { id: 'kancheepuram_city', name: 'Kancheepuram', isOperational: false },
            { id: 'sriperumbudur', name: 'Sriperumbudur', isOperational: false },
            { id: 'walajabad', name: 'Walajabad', isOperational: false },
          ],
        },
        {
          id: 'kanniyakumari',
          name: 'Kanniyakumari',
          isOperational: false,
          coordinates: [8.08, 77.57],
          cities: [
            { id: 'nagercoil', name: 'Nagercoil', isOperational: false },
            { id: 'kanniyakumari_town', name: 'Kanniyakumari', isOperational: false },
            { id: 'padmanabhapuram', name: 'Padmanabhapuram', isOperational: false },
          ],
        },
        {
          id: 'karur',
          name: 'Karur',
          isOperational: false,
          coordinates: [10.96, 78.08],
          cities: [
            { id: 'karur_town', name: 'Karur', isOperational: false },
            { id: 'kulithalai', name: 'Kulithalai', isOperational: false },
          ],
        },
        {
          id: 'krishnagiri',
          name: 'Krishnagiri',
          isOperational: false,
          coordinates: [12.52, 78.21],
          cities: [
            { id: 'krishnagiri_town', name: 'Krishnagiri', isOperational: false },
            { id: 'hosur', name: 'Hosur', isOperational: false },
          ],
        },
        {
          id: 'madurai',
          name: 'Madurai',
          isOperational: false,
          coordinates: [9.9252, 78.1198],
          cities: [
            { id: 'goripalayam', name: 'Goripalayam', isOperational: false, coordinates: [9.928, 78.130] },
            { id: 'madurai_city', name: 'Madurai City', isOperational: false, coordinates: [9.9252, 78.1198] },
            { id: 'melur', name: 'Melur', isOperational: false, coordinates: [10.030, 78.330] },
            { id: 'thirumangalam', name: 'Thirumangalam', isOperational: false, coordinates: [9.824, 77.986] },
          ],
        },
        {
          id: 'mayiladuthurai',
          name: 'Mayiladuthurai',
          isOperational: false,
          coordinates: [11.1, 79.65],
          cities: [
            { id: 'mayiladuthurai_town', name: 'Mayiladuthurai', isOperational: false },
            { id: 'sirkazhi', name: 'Sirkazhi', isOperational: false },
          ],
        },
        {
          id: 'nagapattinam',
          name: 'Nagapattinam',
          isOperational: false,
          coordinates: [10.76, 79.84],
          cities: [
            { id: 'nagapattinam_town', name: 'Nagapattinam', isOperational: false },
            { id: 'velankanni', name: 'Velankanni', isOperational: false },
            { id: 'vedaranyam', name: 'Vedaranyam', isOperational: false },
          ],
        },
        {
          id: 'namakkal',
          name: 'Namakkal',
          isOperational: false,
          coordinates: [11.22, 78.17],
          cities: [
            { id: 'namakkal_town', name: 'Namakkal', isOperational: false },
            { id: 'rasipuram', name: 'Rasipuram', isOperational: false },
            { id: 'tiruchengode', name: 'Tiruchengode', isOperational: false },
          ],
        },
        {
          id: 'perambalur',
          name: 'Perambalur',
          isOperational: false,
          coordinates: [11.23, 78.88],
          cities: [
            { id: 'perambalur_town', name: 'Perambalur', isOperational: false },
            { id: 'veppanthattai', name: 'Veppanthattai', isOperational: false },
          ],
        },
        {
          id: 'pudukkottai',
          name: 'Pudukkottai',
          isOperational: false,
          coordinates: [10.38, 78.82],
          cities: [
            { id: 'pudukkottai_town', name: 'Pudukkottai', isOperational: false },
            { id: 'aranthangi', name: 'Aranthangi', isOperational: false },
          ],
        },
        {
          id: 'ramanathapuram',
          name: 'Ramanathapuram',
          isOperational: false,
          coordinates: [9.37, 78.83],
          cities: [
            { id: 'ramanathapuram_town', name: 'Ramanathapuram', isOperational: false },
            { id: 'rameswaram', name: 'Rameswaram', isOperational: false },
            { id: 'paramakudi', name: 'Paramakudi', isOperational: false },
          ],
        },
        {
          id: 'ranipet',
          name: 'Ranipet',
          isOperational: false,
          coordinates: [12.92, 79.33],
          cities: [
            { id: 'ranipet_town', name: 'Ranipet', isOperational: false },
            { id: 'arakkonam', name: 'Arakkonam', isOperational: false },
            { id: 'walajapet', name: 'Walajapet', isOperational: false },
          ],
        },
        {
          id: 'salem',
          name: 'Salem',
          isOperational: false,
          coordinates: [11.6643, 78.146],
          cities: [
            { id: 'hasthampatti', name: 'Hasthampatti', isOperational: false, coordinates: [11.670, 78.155] },
            { id: 'salem_city', name: 'Salem City', isOperational: false, coordinates: [11.6643, 78.146] },
            { id: 'attur', name: 'Attur', isOperational: false, coordinates: [11.595, 78.598] },
            { id: 'mettur', name: 'Mettur', isOperational: false, coordinates: [11.796, 77.800] },
          ],
        },
        {
          id: 'sivaganga',
          name: 'Sivaganga',
          isOperational: false,
          coordinates: [9.85, 78.48],
          cities: [
            { id: 'sivaganga_town', name: 'Sivaganga', isOperational: false },
            { id: 'karaikudi', name: 'Karaikudi', isOperational: false },
          ],
        },
        {
          id: 'tenkasi',
          name: 'Tenkasi',
          isOperational: false,
          coordinates: [8.96, 77.31],
          cities: [
            { id: 'tenkasi_town', name: 'Tenkasi', isOperational: false },
            { id: 'sankarankovil', name: 'Sankarankovil', isOperational: false },
          ],
        },
        {
          id: 'thanjavur',
          name: 'Thanjavur',
          isOperational: false,
          coordinates: [10.78, 79.13],
          cities: [
            { id: 'thanjavur_city', name: 'Thanjavur', isOperational: false },
            { id: 'kumbakonam', name: 'Kumbakonam', isOperational: false },
            { id: 'pattukkottai', name: 'Pattukkottai', isOperational: false },
          ],
        },
        {
          id: 'the_nilgiris',
          name: 'The Nilgiris',
          isOperational: false,
          coordinates: [11.41, 76.7],
          cities: [
            { id: 'ooty', name: 'Udhagamandalam (Ooty)', isOperational: false },
            { id: 'coonoor', name: 'Coonoor', isOperational: false },
            { id: 'kotagiri', name: 'Kotagiri', isOperational: false },
          ],
        },
        {
          id: 'theni',
          name: 'Theni',
          isOperational: false,
          coordinates: [10.01, 77.47],
          cities: [
            { id: 'theni_town', name: 'Theni', isOperational: false },
            { id: 'periyakulam', name: 'Periyakulam', isOperational: false },
            { id: 'cumbum', name: 'Cumbum', isOperational: false },
          ],
        },
        {
          id: 'thoothukudi',
          name: 'Thoothukudi',
          isOperational: false,
          coordinates: [8.76, 78.13],
          cities: [
            { id: 'thoothukudi_city', name: 'Thoothukudi', isOperational: false },
            { id: 'kovilpatti', name: 'Kovilpatti', isOperational: false },
            { id: 'tiruchendur', name: 'Tiruchendur', isOperational: false },
          ],
        },
        {
          id: 'tiruchirappalli',
          name: 'Tiruchirappalli',
          isOperational: false,
          coordinates: [10.7905, 78.7047],
          cities: [
            { id: 'trichy_city', name: 'Tiruchirappalli', isOperational: false },
            { id: 'manapparai', name: 'Manapparai', isOperational: false },
            { id: 'thuraiyur', name: 'Thuraiyur', isOperational: false },
          ],
        },
        {
          id: 'tirunelveli',
          name: 'Tirunelveli',
          isOperational: false,
          coordinates: [8.7139, 77.7567],
          cities: [
            { id: 'tirunelveli_city', name: 'Tirunelveli', isOperational: false },
            { id: 'palayamkottai', name: 'Palayamkottai', isOperational: false },
            { id: 'ambasamudram', name: 'Ambasamudram', isOperational: false },
          ],
        },
        {
          id: 'tirupathur',
          name: 'Tirupathur',
          isOperational: false,
          coordinates: [12.49, 78.56],
          cities: [
            { id: 'tirupathur_town', name: 'Tirupathur', isOperational: false },
            { id: 'vaniyambadi', name: 'Vaniyambadi', isOperational: false },
            { id: 'ambur', name: 'Ambur', isOperational: false },
          ],
        },
        {
          id: 'tiruppur',
          name: 'Tiruppur',
          isOperational: false,
          coordinates: [11.1085, 77.3411],
          cities: [
            { id: 'tiruppur_city', name: 'Tiruppur', isOperational: false },
            { id: 'avinashi', name: 'Avinashi', isOperational: false },
            { id: 'dharapuram', name: 'Dharapuram', isOperational: false },
          ],
        },
        {
          id: 'tiruvallur',
          name: 'Tiruvallur',
          isOperational: false,
          coordinates: [13.14, 79.91],
          cities: [
            { id: 'tiruvallur_town', name: 'Tiruvallur', isOperational: false },
            { id: 'avadi', name: 'Avadi', isOperational: false },
            { id: 'poonamallee', name: 'Poonamallee', isOperational: false },
          ],
        },
        {
          id: 'tiruvannamalai',
          name: 'Tiruvannamalai',
          isOperational: false,
          coordinates: [12.22, 79.07],
          cities: [
            { id: 'tiruvannamalai_town', name: 'Tiruvannamalai', isOperational: false },
            { id: 'arani', name: 'Arani', isOperational: false },
          ],
        },
        {
          id: 'tiruvarur',
          name: 'Tiruvarur',
          isOperational: false,
          coordinates: [10.77, 79.63],
          cities: [
            { id: 'tiruvarur_town', name: 'Tiruvarur', isOperational: false },
            { id: 'mannargudi', name: 'Mannargudi', isOperational: false },
          ],
        },
        {
          id: 'vellore',
          name: 'Vellore',
          isOperational: false,
          coordinates: [12.9165, 79.1325],
          cities: [
            { id: 'vellore_city', name: 'Vellore', isOperational: false },
            { id: 'katpadi', name: 'Katpadi', isOperational: false },
            { id: 'gudiyatham', name: 'Gudiyatham', isOperational: false },
          ],
        },
        {
          id: 'viluppuram',
          name: 'Viluppuram',
          isOperational: false,
          coordinates: [11.94, 79.492],
          cities: [
            { id: 'viluppuram_town', name: 'Viluppuram', isOperational: false },
            { id: 'tindivanam', name: 'Tindivanam', isOperational: false },
          ],
        },
        {
          id: 'virudhunagar',
          name: 'Virudhunagar',
          isOperational: false,
          coordinates: [9.58, 77.95],
          cities: [
            { id: 'virudhunagar_town', name: 'Virudhunagar', isOperational: false },
            { id: 'sivakasi', name: 'Sivakasi', isOperational: false },
            { id: 'rajapalayam', name: 'Rajapalayam', isOperational: false },
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 2. ANDHRA PRADESH
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'andhra_pradesh',
      name: 'Andhra Pradesh',
      code: 'AP',
      isOperational: false,
      coordinates: [15.9129, 79.74],
      districts: [
        {
          id: 'visakhapatnam',
          name: 'Visakhapatnam',
          isOperational: false,
          coordinates: [17.6868, 83.2185],
          cities: [
            { id: 'vizag_city', name: 'Visakhapatnam', isOperational: false },
            { id: 'gajuwaka', name: 'Gajuwaka', isOperational: false },
            { id: 'anakapalle', name: 'Anakapalle', isOperational: false },
          ],
        },
        {
          id: 'ntr',
          name: 'NTR (Vijayawada)',
          isOperational: false,
          coordinates: [16.5062, 80.648],
          cities: [
            { id: 'vijayawada', name: 'Vijayawada', isOperational: false },
            { id: 'jaggaiahpeta', name: 'Jaggaiahpeta', isOperational: false },
            { id: 'nandigama', name: 'Nandigama', isOperational: false },
          ],
        },
        {
          id: 'guntur',
          name: 'Guntur',
          isOperational: false,
          coordinates: [16.3067, 80.4365],
          cities: [
            { id: 'guntur_city', name: 'Guntur', isOperational: false },
            { id: 'tenali', name: 'Tenali', isOperational: false },
            { id: 'mangalagiri', name: 'Mangalagiri', isOperational: false },
          ],
        },
        {
          id: 'tirupati',
          name: 'Tirupati',
          isOperational: false,
          coordinates: [13.6288, 79.4192],
          cities: [
            { id: 'tirupati_city', name: 'Tirupati', isOperational: false },
            { id: 'srikalahasti', name: 'Srikalahasti', isOperational: false },
            { id: 'gudur', name: 'Gudur', isOperational: false },
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 3. ARUNACHAL PRADESH
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'arunachal_pradesh',
      name: 'Arunachal Pradesh',
      code: 'AR',
      isOperational: false,
      coordinates: [28.218, 94.7278],
      districts: [
        {
          id: 'papum_pare',
          name: 'Papum Pare',
          isOperational: false,
          coordinates: [27.1, 93.62],
          cities: [
            { id: 'itanagar', name: 'Itanagar', isOperational: false },
            { id: 'naharlagun', name: 'Naharlagun', isOperational: false },
          ],
        },
        {
          id: 'east_siang',
          name: 'East Siang',
          isOperational: false,
          coordinates: [28.07, 95.33],
          cities: [
            { id: 'pasighat', name: 'Pasighat', isOperational: false },
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 4. ASSAM
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'assam',
      name: 'Assam',
      code: 'AS',
      isOperational: false,
      coordinates: [26.2006, 92.9376],
      districts: [
        {
          id: 'kamrup_metropolitan',
          name: 'Kamrup Metropolitan',
          isOperational: false,
          coordinates: [26.1445, 91.7362],
          cities: [
            { id: 'guwahati', name: 'Guwahati', isOperational: false },
            { id: 'dispur', name: 'Dispur', isOperational: false },
          ],
        },
        {
          id: 'dibrugarh',
          name: 'Dibrugarh',
          isOperational: false,
          coordinates: [27.4728, 94.912],
          cities: [
            { id: 'dibrugarh_city', name: 'Dibrugarh', isOperational: false },
            { id: 'chabua', name: 'Chabua', isOperational: false },
          ],
        },
        {
          id: 'cachar',
          name: 'Cachar',
          isOperational: false,
          coordinates: [24.8333, 92.7789],
          cities: [
            { id: 'silchar', name: 'Silchar', isOperational: false },
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 5. BIHAR
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'bihar',
      name: 'Bihar',
      code: 'BR',
      isOperational: false,
      coordinates: [25.0961, 85.3131],
      districts: [
        {
          id: 'patna',
          name: 'Patna',
          isOperational: false,
          coordinates: [25.5941, 85.1376],
          cities: [
            { id: 'patna_city', name: 'Patna', isOperational: false },
            { id: 'danapur', name: 'Danapur', isOperational: false },
          ],
        },
        {
          id: 'gaya',
          name: 'Gaya',
          isOperational: false,
          coordinates: [24.7914, 85.0002],
          cities: [
            { id: 'gaya_city', name: 'Gaya', isOperational: false },
            { id: 'bodh_gaya', name: 'Bodh Gaya', isOperational: false },
          ],
        },
        {
          id: 'muzaffarpur',
          name: 'Muzaffarpur',
          isOperational: false,
          coordinates: [26.1209, 85.3647],
          cities: [
            { id: 'muzaffarpur_city', name: 'Muzaffarpur', isOperational: false },
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 6. CHHATTISGARH
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'chhattisgarh',
      name: 'Chhattisgarh',
      code: 'CG',
      isOperational: false,
      coordinates: [21.2787, 81.8661],
      districts: [
        {
          id: 'raipur',
          name: 'Raipur',
          isOperational: false,
          coordinates: [21.2514, 81.6296],
          cities: [
            { id: 'raipur_city', name: 'Raipur', isOperational: false },
            { id: 'birgaon', name: 'Birgaon', isOperational: false },
          ],
        },
        {
          id: 'durg',
          name: 'Durg',
          isOperational: false,
          coordinates: [21.1904, 81.2849],
          cities: [
            { id: 'bhilai', name: 'Bhilai', isOperational: false },
            { id: 'durg_city', name: 'Durg', isOperational: false },
          ],
        },
        {
          id: 'bilaspur',
          name: 'Bilaspur',
          isOperational: false,
          coordinates: [22.0797, 82.1409],
          cities: [
            { id: 'bilaspur_city', name: 'Bilaspur', isOperational: false },
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 7. GOA
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'goa',
      name: 'Goa',
      code: 'GA',
      isOperational: false,
      coordinates: [15.2993, 74.124],
      districts: [
        {
          id: 'north_goa',
          name: 'North Goa',
          isOperational: false,
          coordinates: [15.4989, 73.8278],
          cities: [
            { id: 'panaji', name: 'Panaji', isOperational: false },
            { id: 'mapusa', name: 'Mapusa', isOperational: false },
            { id: 'calangute', name: 'Calangute', isOperational: false },
          ],
        },
        {
          id: 'south_goa',
          name: 'South Goa',
          isOperational: false,
          coordinates: [15.2736, 73.9582],
          cities: [
            { id: 'margao', name: 'Margao', isOperational: false },
            { id: 'vasco_da_gama', name: 'Vasco da Gama', isOperational: false },
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 8. GUJARAT
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'gujarat',
      name: 'Gujarat',
      code: 'GJ',
      isOperational: false,
      coordinates: [22.2587, 71.1924],
      districts: [
        {
          id: 'ahmedabad',
          name: 'Ahmedabad',
          isOperational: false,
          coordinates: [23.0225, 72.5714],
          cities: [
            { id: 'ahmedabad_city', name: 'Ahmedabad', isOperational: false },
            { id: 'sanand', name: 'Sanand', isOperational: false },
          ],
        },
        {
          id: 'surat',
          name: 'Surat',
          isOperational: false,
          coordinates: [21.1702, 72.8311],
          cities: [
            { id: 'surat_city', name: 'Surat', isOperational: false },
            { id: 'bardoli', name: 'Bardoli', isOperational: false },
          ],
        },
        {
          id: 'vadodara',
          name: 'Vadodara',
          isOperational: false,
          coordinates: [22.3072, 73.1812],
          cities: [
            { id: 'vadodara_city', name: 'Vadodara', isOperational: false },
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 9. HARYANA
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'haryana',
      name: 'Haryana',
      code: 'HR',
      isOperational: false,
      coordinates: [29.0588, 76.0856],
      districts: [
        {
          id: 'gurugram',
          name: 'Gurugram',
          isOperational: false,
          coordinates: [28.4595, 77.0266],
          cities: [
            { id: 'gurugram_city', name: 'Gurugram', isOperational: false },
            { id: 'manesar', name: 'Manesar', isOperational: false },
            { id: 'sohna', name: 'Sohna', isOperational: false },
          ],
        },
        {
          id: 'faridabad',
          name: 'Faridabad',
          isOperational: false,
          coordinates: [28.4089, 77.3178],
          cities: [
            { id: 'faridabad_city', name: 'Faridabad', isOperational: false },
            { id: 'ballabgarh', name: 'Ballabgarh', isOperational: false },
          ],
        },
        {
          id: 'panchkula',
          name: 'Panchkula',
          isOperational: false,
          coordinates: [30.6942, 76.8606],
          cities: [
            { id: 'panchkula_city', name: 'Panchkula', isOperational: false },
            { id: 'kalka', name: 'Kalka', isOperational: false },
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 10. HIMACHAL PRADESH
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'himachal_pradesh',
      name: 'Himachal Pradesh',
      code: 'HP',
      isOperational: false,
      coordinates: [31.1048, 77.1734],
      districts: [
        {
          id: 'shimla',
          name: 'Shimla',
          isOperational: false,
          coordinates: [31.1048, 77.1734],
          cities: [
            { id: 'shimla_city', name: 'Shimla', isOperational: false },
            { id: 'rampur', name: 'Rampur', isOperational: false },
          ],
        },
        {
          id: 'kangra',
          name: 'Kangra',
          isOperational: false,
          coordinates: [32.0998, 76.2691],
          cities: [
            { id: 'dharamshala', name: 'Dharamshala', isOperational: false },
            { id: 'kangra_town', name: 'Kangra', isOperational: false },
          ],
        },
        {
          id: 'kullu',
          name: 'Kullu',
          isOperational: false,
          coordinates: [31.9579, 77.1095],
          cities: [
            { id: 'kullu_town', name: 'Kullu', isOperational: false },
            { id: 'manali', name: 'Manali', isOperational: false },
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 11. JHARKHAND
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'jharkhand',
      name: 'Jharkhand',
      code: 'JH',
      isOperational: false,
      coordinates: [23.6102, 85.2799],
      districts: [
        {
          id: 'ranchi',
          name: 'Ranchi',
          isOperational: false,
          coordinates: [23.3441, 85.3096],
          cities: [
            { id: 'ranchi_city', name: 'Ranchi', isOperational: false },
            { id: 'kanke', name: 'Kanke', isOperational: false },
          ],
        },
        {
          id: 'east_singhbhum',
          name: 'East Singhbhum',
          isOperational: false,
          coordinates: [22.8046, 86.2029],
          cities: [
            { id: 'jamshedpur', name: 'Jamshedpur', isOperational: false },
            { id: 'ghatshila', name: 'Ghatshila', isOperational: false },
          ],
        },
        {
          id: 'dhanbad',
          name: 'Dhanbad',
          isOperational: false,
          coordinates: [23.7957, 86.4304],
          cities: [
            { id: 'dhanbad_city', name: 'Dhanbad', isOperational: false },
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 12. KARNATAKA
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'karnataka',
      name: 'Karnataka',
      code: 'KA',
      isOperational: false,
      coordinates: [15.3173, 75.7139],
      districts: [
        {
          id: 'bengaluru_urban',
          name: 'Bengaluru Urban',
          isOperational: false,
          coordinates: [12.9716, 77.5946],
          cities: [
            { id: 'bengaluru_city', name: 'Bengaluru', isOperational: false },
            { id: 'yelahanka', name: 'Yelahanka', isOperational: false },
            { id: 'anekal', name: 'Anekal', isOperational: false },
          ],
        },
        {
          id: 'mysuru',
          name: 'Mysuru',
          isOperational: false,
          coordinates: [12.2958, 76.6394],
          cities: [
            { id: 'mysuru_city', name: 'Mysuru', isOperational: false },
            { id: 'nanjangud', name: 'Nanjangud', isOperational: false },
          ],
        },
        {
          id: 'dakshina_kannada',
          name: 'Dakshina Kannada',
          isOperational: false,
          coordinates: [12.9141, 74.856],
          cities: [
            { id: 'mangaluru', name: 'Mangaluru', isOperational: false },
            { id: 'bantwal', name: 'Bantwal', isOperational: false },
          ],
        },
        {
          id: 'dharwad',
          name: 'Dharwad',
          isOperational: false,
          coordinates: [15.4589, 75.0078],
          cities: [
            { id: 'hubballi', name: 'Hubballi', isOperational: false },
            { id: 'dharwad_city', name: 'Dharwad', isOperational: false },
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 13. KERALA
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'kerala',
      name: 'Kerala',
      code: 'KL',
      isOperational: false,
      coordinates: [10.8505, 76.2711],
      districts: [
        {
          id: 'ernakulam',
          name: 'Ernakulam',
          isOperational: false,
          coordinates: [9.9816, 76.2999],
          cities: [
            { id: 'kochi', name: 'Kochi', isOperational: false },
            { id: 'aluva', name: 'Aluva', isOperational: false },
            { id: 'angamaly', name: 'Angamaly', isOperational: false },
          ],
        },
        {
          id: 'thiruvananthapuram',
          name: 'Thiruvananthapuram',
          isOperational: false,
          coordinates: [8.5241, 76.9366],
          cities: [
            { id: 'tvm_city', name: 'Thiruvananthapuram', isOperational: false },
            { id: 'attingal', name: 'Attingal', isOperational: false },
            { id: 'neyyattinkara', name: 'Neyyattinkara', isOperational: false },
          ],
        },
        {
          id: 'kozhikode',
          name: 'Kozhikode',
          isOperational: false,
          coordinates: [11.2588, 75.7804],
          cities: [
            { id: 'kozhikode_city', name: 'Kozhikode', isOperational: false },
            { id: 'vadakara', name: 'Vadakara', isOperational: false },
          ],
        },
        {
          id: 'thrissur',
          name: 'Thrissur',
          isOperational: false,
          coordinates: [10.5276, 76.2144],
          cities: [
            { id: 'thrissur_city', name: 'Thrissur', isOperational: false },
            { id: 'chalakudy', name: 'Chalakudy', isOperational: false },
          ],
        },
        {
          id: 'wayanad',
          name: 'Wayanad',
          isOperational: false,
          coordinates: [11.6854, 76.132],
          cities: [
            { id: 'kalpetta', name: 'Kalpetta', isOperational: false },
            { id: 'sulthan_bathery', name: 'Sulthan Bathery', isOperational: false },
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 14. MADHYA PRADESH
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'madhya_pradesh',
      name: 'Madhya Pradesh',
      code: 'MP',
      isOperational: false,
      coordinates: [22.9734, 78.6569],
      districts: [
        {
          id: 'bhopal',
          name: 'Bhopal',
          isOperational: false,
          coordinates: [23.2599, 77.4126],
          cities: [
            { id: 'bhopal_city', name: 'Bhopal', isOperational: false },
            { id: 'berasia', name: 'Berasia', isOperational: false },
          ],
        },
        {
          id: 'indore',
          name: 'Indore',
          isOperational: false,
          coordinates: [22.7196, 75.8577],
          cities: [
            { id: 'indore_city', name: 'Indore', isOperational: false },
            { id: 'mhow', name: 'Dr. Ambedkar Nagar (Mhow)', isOperational: false },
          ],
        },
        {
          id: 'gwalior',
          name: 'Gwalior',
          isOperational: false,
          coordinates: [26.2183, 78.1828],
          cities: [
            { id: 'gwalior_city', name: 'Gwalior', isOperational: false },
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 15. MAHARASHTRA
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'maharashtra',
      name: 'Maharashtra',
      code: 'MH',
      isOperational: false,
      coordinates: [19.7515, 75.7139],
      districts: [
        {
          id: 'mumbai_suburban',
          name: 'Mumbai Suburban',
          isOperational: false,
          coordinates: [19.076, 72.8777],
          cities: [
            { id: 'mumbai_city', name: 'Mumbai', isOperational: false },
            { id: 'bandra', name: 'Bandra', isOperational: false },
            { id: 'andheri', name: 'Andheri', isOperational: false },
            { id: 'borivali', name: 'Borivali', isOperational: false },
          ],
        },
        {
          id: 'mumbai_city',
          name: 'Mumbai City',
          isOperational: false,
          coordinates: [18.9388, 72.8354],
          cities: [
            { id: 'south_mumbai', name: 'South Mumbai', isOperational: false },
            { id: 'dadar', name: 'Dadar', isOperational: false },
          ],
        },
        {
          id: 'pune',
          name: 'Pune',
          isOperational: false,
          coordinates: [18.5204, 73.8567],
          cities: [
            { id: 'pune_city', name: 'Pune', isOperational: false },
            { id: 'pcmc', name: 'Pimpri-Chinchwad', isOperational: false },
          ],
        },
        {
          id: 'nagpur',
          name: 'Nagpur',
          isOperational: false,
          coordinates: [21.1458, 79.0882],
          cities: [
            { id: 'nagpur_city', name: 'Nagpur', isOperational: false },
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 16. MANIPUR
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'manipur',
      name: 'Manipur',
      code: 'MN',
      isOperational: false,
      coordinates: [24.6637, 93.9063],
      districts: [
        {
          id: 'imphal_west',
          name: 'Imphal West',
          isOperational: false,
          coordinates: [24.817, 93.9368],
          cities: [
            { id: 'imphal', name: 'Imphal', isOperational: false },
          ],
        },
        {
          id: 'churachandpur',
          name: 'Churachandpur',
          isOperational: false,
          coordinates: [24.3333, 93.6667],
          cities: [
            { id: 'churachandpur_town', name: 'Churachandpur', isOperational: false },
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 17. MEGHALAYA
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'meghalaya',
      name: 'Meghalaya',
      code: 'ML',
      isOperational: false,
      coordinates: [25.467, 91.3662],
      districts: [
        {
          id: 'east_khasi_hills',
          name: 'East Khasi Hills',
          isOperational: false,
          coordinates: [25.5788, 91.8933],
          cities: [
            { id: 'shillong', name: 'Shillong', isOperational: false },
            { id: 'sohra', name: 'Sohra (Cherrapunji)', isOperational: false },
          ],
        },
        {
          id: 'west_garo_hills',
          name: 'West Garo Hills',
          isOperational: false,
          coordinates: [25.5144, 90.2201],
          cities: [
            { id: 'tura', name: 'Tura', isOperational: false },
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 18. MIZORAM
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'mizoram',
      name: 'Mizoram',
      code: 'MZ',
      isOperational: false,
      coordinates: [23.1645, 92.9376],
      districts: [
        {
          id: 'aizawl',
          name: 'Aizawl',
          isOperational: false,
          coordinates: [23.7271, 92.7176],
          cities: [
            { id: 'aizawl_city', name: 'Aizawl', isOperational: false },
          ],
        },
        {
          id: 'lunglei',
          name: 'Lunglei',
          isOperational: false,
          coordinates: [22.8671, 92.744],
          cities: [
            { id: 'lunglei_town', name: 'Lunglei', isOperational: false },
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 19. NAGALAND
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'nagaland',
      name: 'Nagaland',
      code: 'NL',
      isOperational: false,
      coordinates: [26.1584, 94.5624],
      districts: [
        {
          id: 'kohima',
          name: 'Kohima',
          isOperational: false,
          coordinates: [25.6751, 94.1086],
          cities: [
            { id: 'kohima_city', name: 'Kohima', isOperational: false },
          ],
        },
        {
          id: 'dimapur',
          name: 'Dimapur',
          isOperational: false,
          coordinates: [25.9094, 93.7266],
          cities: [
            { id: 'dimapur_city', name: 'Dimapur', isOperational: false },
            { id: 'chumukedima', name: 'Chumukedima', isOperational: false },
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 20. ODISHA
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'odisha',
      name: 'Odisha',
      code: 'OD',
      isOperational: false,
      coordinates: [20.9517, 85.0985],
      districts: [
        {
          id: 'khordha',
          name: 'Khordha',
          isOperational: false,
          coordinates: [20.2961, 85.8245],
          cities: [
            { id: 'bhubaneswar', name: 'Bhubaneswar', isOperational: false },
            { id: 'jatni', name: 'Jatni', isOperational: false },
          ],
        },
        {
          id: 'cuttack',
          name: 'Cuttack',
          isOperational: false,
          coordinates: [20.4625, 85.8828],
          cities: [
            { id: 'cuttack_city', name: 'Cuttack', isOperational: false },
          ],
        },
        {
          id: 'ganjam',
          name: 'Ganjam',
          isOperational: false,
          coordinates: [19.3149, 84.7941],
          cities: [
            { id: 'berhampur', name: 'Berhampur', isOperational: false },
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 21. PUNJAB
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'punjab',
      name: 'Punjab',
      code: 'PB',
      isOperational: false,
      coordinates: [31.1471, 75.3412],
      districts: [
        {
          id: 'ludhiana',
          name: 'Ludhiana',
          isOperational: false,
          coordinates: [30.901, 75.8573],
          cities: [
            { id: 'ludhiana_city', name: 'Ludhiana', isOperational: false },
            { id: 'khanna', name: 'Khanna', isOperational: false },
          ],
        },
        {
          id: 'amritsar',
          name: 'Amritsar',
          isOperational: false,
          coordinates: [31.634, 74.8723],
          cities: [
            { id: 'amritsar_city', name: 'Amritsar', isOperational: false },
          ],
        },
        {
          id: 'sas_nagar',
          name: 'SAS Nagar (Mohali)',
          isOperational: false,
          coordinates: [30.7046, 76.7179],
          cities: [
            { id: 'mohali', name: 'Mohali', isOperational: false },
            { id: 'kharar', name: 'Kharar', isOperational: false },
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 22. RAJASTHAN
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'rajasthan',
      name: 'Rajasthan',
      code: 'RJ',
      isOperational: false,
      coordinates: [27.0238, 74.2179],
      districts: [
        {
          id: 'jaipur',
          name: 'Jaipur',
          isOperational: false,
          coordinates: [26.9124, 75.7873],
          cities: [
            { id: 'jaipur_city', name: 'Jaipur', isOperational: false },
            { id: 'amer', name: 'Amer', isOperational: false },
            { id: 'sanganer', name: 'Sanganer', isOperational: false },
          ],
        },
        {
          id: 'jodhpur',
          name: 'Jodhpur',
          isOperational: false,
          coordinates: [26.2389, 73.0243],
          cities: [
            { id: 'jodhpur_city', name: 'Jodhpur', isOperational: false },
          ],
        },
        {
          id: 'udaipur',
          name: 'Udaipur',
          isOperational: false,
          coordinates: [24.5854, 73.7125],
          cities: [
            { id: 'udaipur_city', name: 'Udaipur', isOperational: false },
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 23. SIKKIM
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'sikkim',
      name: 'Sikkim',
      code: 'SK',
      isOperational: false,
      coordinates: [27.533, 88.5122],
      districts: [
        {
          id: 'gangtok',
          name: 'Gangtok',
          isOperational: false,
          coordinates: [27.3389, 88.6065],
          cities: [
            { id: 'gangtok_city', name: 'Gangtok', isOperational: false },
            { id: 'singtam', name: 'Singtam', isOperational: false },
          ],
        },
        {
          id: 'namchi',
          name: 'Namchi',
          isOperational: false,
          coordinates: [27.1667, 88.35],
          cities: [
            { id: 'namchi_town', name: 'Namchi', isOperational: false },
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 24. TELANGANA
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'telangana',
      name: 'Telangana',
      code: 'TG',
      isOperational: false,
      coordinates: [18.1124, 79.0193],
      districts: [
        {
          id: 'hyderabad',
          name: 'Hyderabad',
          isOperational: false,
          coordinates: [17.385, 78.4867],
          cities: [
            { id: 'hyderabad_city', name: 'Hyderabad', isOperational: false },
            { id: 'secunderabad', name: 'Secunderabad', isOperational: false },
            { id: 'charminar', name: 'Charminar', isOperational: false },
          ],
        },
        {
          id: 'medchal_malkajgiri',
          name: 'Medchal-Malkajgiri',
          isOperational: false,
          coordinates: [17.545, 78.488],
          cities: [
            { id: 'kukatpally', name: 'Kukatpally', isOperational: false },
            { id: 'malkajgiri', name: 'Malkajgiri', isOperational: false },
          ],
        },
        {
          id: 'warangal',
          name: 'Warangal',
          isOperational: false,
          coordinates: [17.9689, 79.5941],
          cities: [
            { id: 'warangal_city', name: 'Warangal', isOperational: false },
            { id: 'kazipet', name: 'Kazipet', isOperational: false },
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 25. TRIPURA
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'tripura',
      name: 'Tripura',
      code: 'TR',
      isOperational: false,
      coordinates: [23.9408, 91.9882],
      districts: [
        {
          id: 'west_tripura',
          name: 'West Tripura',
          isOperational: false,
          coordinates: [23.8315, 91.2868],
          cities: [
            { id: 'agartala', name: 'Agartala', isOperational: false },
          ],
        },
        {
          id: 'gomati',
          name: 'Gomati',
          isOperational: false,
          coordinates: [23.5333, 91.5],
          cities: [
            { id: 'udaipur_tr', name: 'Udaipur', isOperational: false },
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 26. UTTAR PRADESH
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'uttar_pradesh',
      name: 'Uttar Pradesh',
      code: 'UP',
      isOperational: false,
      coordinates: [26.8467, 80.9462],
      districts: [
        {
          id: 'lucknow',
          name: 'Lucknow',
          isOperational: false,
          coordinates: [26.8467, 80.9462],
          cities: [
            { id: 'lucknow_city', name: 'Lucknow', isOperational: false },
            { id: 'mohanlalganj', name: 'Mohanlalganj', isOperational: false },
          ],
        },
        {
          id: 'gautam_buddha_nagar',
          name: 'Gautam Buddha Nagar',
          isOperational: false,
          coordinates: [28.5355, 77.391],
          cities: [
            { id: 'noida', name: 'Noida', isOperational: false },
            { id: 'greater_noida', name: 'Greater Noida', isOperational: false },
          ],
        },
        {
          id: 'kanpur_nagar',
          name: 'Kanpur Nagar',
          isOperational: false,
          coordinates: [26.4499, 80.3319],
          cities: [
            { id: 'kanpur_city', name: 'Kanpur', isOperational: false },
          ],
        },
        {
          id: 'varanasi',
          name: 'Varanasi',
          isOperational: false,
          coordinates: [25.3176, 82.9739],
          cities: [
            { id: 'varanasi_city', name: 'Varanasi', isOperational: false },
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 27. UTTARAKHAND
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'uttarakhand',
      name: 'Uttarakhand',
      code: 'UK',
      isOperational: false,
      coordinates: [30.0668, 79.0193],
      districts: [
        {
          id: 'dehradun',
          name: 'Dehradun',
          isOperational: false,
          coordinates: [30.3165, 78.0322],
          cities: [
            { id: 'dehradun_city', name: 'Dehradun', isOperational: false },
            { id: 'rishikesh', name: 'Rishikesh', isOperational: false },
            { id: 'mussoorie', name: 'Mussoorie', isOperational: false },
          ],
        },
        {
          id: 'haridwar',
          name: 'Haridwar',
          isOperational: false,
          coordinates: [29.9457, 78.1642],
          cities: [
            { id: 'haridwar_city', name: 'Haridwar', isOperational: false },
            { id: 'roorkee', name: 'Roorkee', isOperational: false },
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 28. WEST BENGAL
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'west_bengal',
      name: 'West Bengal',
      code: 'WB',
      isOperational: false,
      coordinates: [22.9868, 87.855],
      districts: [
        {
          id: 'kolkata',
          name: 'Kolkata',
          isOperational: false,
          coordinates: [22.5726, 88.3639],
          cities: [
            { id: 'kolkata_city', name: 'Kolkata', isOperational: false },
            { id: 'alipore', name: 'Alipore', isOperational: false },
          ],
        },
        {
          id: 'north_24_parganas',
          name: 'North 24 Parganas',
          isOperational: false,
          coordinates: [22.723, 88.481],
          cities: [
            { id: 'salt_lake', name: 'Bidhannagar (Salt Lake)', isOperational: false },
            { id: 'barasat', name: 'Barasat', isOperational: false },
          ],
        },
        {
          id: 'darjeeling',
          name: 'Darjeeling',
          isOperational: false,
          coordinates: [27.041, 88.2663],
          cities: [
            { id: 'darjeeling_town', name: 'Darjeeling', isOperational: false },
            { id: 'siliguri', name: 'Siliguri', isOperational: false },
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 29. ANDAMAN AND NICOBAR ISLANDS (Union Territory 1)
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'andaman_nicobar',
      name: 'Andaman and Nicobar Islands',
      code: 'AN',
      isUt: true,
      isOperational: false,
      coordinates: [11.7401, 92.6586],
      districts: [
        {
          id: 'south_andaman',
          name: 'South Andaman',
          isOperational: false,
          coordinates: [11.6234, 92.7265],
          cities: [
            { id: 'port_blair', name: 'Port Blair', isOperational: false },
            { id: 'garacharma', name: 'Garacharma', isOperational: false },
          ],
        },
        {
          id: 'north_middle_andaman',
          name: 'North and Middle Andaman',
          isOperational: false,
          coordinates: [12.92, 92.93],
          cities: [
            { id: 'mayabunder', name: 'Mayabunder', isOperational: false },
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 30. CHANDIGARH (Union Territory 2)
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'chandigarh',
      name: 'Chandigarh',
      code: 'CH',
      isUt: true,
      isOperational: false,
      coordinates: [30.7333, 76.7794],
      districts: [
        {
          id: 'chandigarh_dist',
          name: 'Chandigarh',
          isOperational: false,
          coordinates: [30.7333, 76.7794],
          cities: [
            { id: 'chandigarh_city', name: 'Chandigarh', isOperational: false },
            { id: 'manimajra', name: 'Manimajra', isOperational: false },
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 31. DADRA AND NAGAR HAVELI AND DAMAN AND DIU (Union Territory 3)
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'dadra_nagar_haveli_daman_diu',
      name: 'Dadra and Nagar Haveli and Daman and Diu',
      code: 'DN',
      isUt: true,
      isOperational: false,
      coordinates: [20.4283, 72.8397],
      districts: [
        {
          id: 'daman',
          name: 'Daman',
          isOperational: false,
          coordinates: [20.4283, 72.8397],
          cities: [
            { id: 'daman_town', name: 'Daman', isOperational: false },
          ],
        },
        {
          id: 'diu',
          name: 'Diu',
          isOperational: false,
          coordinates: [20.7144, 70.9874],
          cities: [
            { id: 'diu_town', name: 'Diu', isOperational: false },
          ],
        },
        {
          id: 'dadra_nagar_haveli',
          name: 'Dadra and Nagar Haveli',
          isOperational: false,
          coordinates: [20.2763, 73.0083],
          cities: [
            { id: 'silvassa', name: 'Silvassa', isOperational: false },
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 32. DELHI (Union Territory 4)
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'delhi',
      name: 'Delhi',
      code: 'DL',
      isUt: true,
      isOperational: false,
      coordinates: [28.7041, 77.1025],
      districts: [
        {
          id: 'new_delhi',
          name: 'New Delhi',
          isOperational: false,
          coordinates: [28.6139, 77.209],
          cities: [
            { id: 'connaught_place', name: 'Connaught Place', isOperational: false },
            { id: 'chanakyapuri', name: 'Chanakyapuri', isOperational: false },
          ],
        },
        {
          id: 'central_delhi',
          name: 'Central Delhi',
          isOperational: false,
          coordinates: [28.6448, 77.2167],
          cities: [
            { id: 'karol_bagh', name: 'Karol Bagh', isOperational: false },
            { id: 'daryaganj', name: 'Daryaganj', isOperational: false },
          ],
        },
        {
          id: 'south_delhi',
          name: 'South Delhi',
          isOperational: false,
          coordinates: [28.5244, 77.2066],
          cities: [
            { id: 'saket', name: 'Saket', isOperational: false },
            { id: 'hauz_khas', name: 'Hauz Khas', isOperational: false },
          ],
        },
        {
          id: 'east_delhi',
          name: 'East Delhi',
          isOperational: false,
          coordinates: [28.6276, 77.2784],
          cities: [
            { id: 'mayur_vihar', name: 'Mayur Vihar', isOperational: false },
            { id: 'preet_vihar', name: 'Preet Vihar', isOperational: false },
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 33. JAMMU AND KASHMIR (Union Territory 5)
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'jammu_and_kashmir',
      name: 'Jammu and Kashmir',
      code: 'JK',
      isUt: true,
      isOperational: false,
      coordinates: [33.7782, 76.5762],
      districts: [
        {
          id: 'srinagar',
          name: 'Srinagar',
          isOperational: false,
          coordinates: [34.0837, 74.7973],
          cities: [
            { id: 'srinagar_city', name: 'Srinagar', isOperational: false },
          ],
        },
        {
          id: 'jammu_dist',
          name: 'Jammu',
          isOperational: false,
          coordinates: [32.7266, 74.857],
          cities: [
            { id: 'jammu_city', name: 'Jammu', isOperational: false },
            { id: 'rs_pura', name: 'RS Pura', isOperational: false },
          ],
        },
        {
          id: 'anantnag',
          name: 'Anantnag',
          isOperational: false,
          coordinates: [33.7311, 75.1522],
          cities: [
            { id: 'anantnag_town', name: 'Anantnag', isOperational: false },
            { id: 'pahalgam', name: 'Pahalgam', isOperational: false },
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 34. LADAKH (Union Territory 6)
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'ladakh',
      name: 'Ladakh',
      code: 'LA',
      isUt: true,
      isOperational: false,
      coordinates: [34.1526, 77.5771],
      districts: [
        {
          id: 'leh',
          name: 'Leh',
          isOperational: false,
          coordinates: [34.1526, 77.5771],
          cities: [
            { id: 'leh_town', name: 'Leh', isOperational: false },
            { id: 'diskit', name: 'Diskit', isOperational: false },
          ],
        },
        {
          id: 'kargil',
          name: 'Kargil',
          isOperational: false,
          coordinates: [34.5539, 76.1349],
          cities: [
            { id: 'kargil_town', name: 'Kargil', isOperational: false },
            { id: 'dras', name: 'Dras', isOperational: false },
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 35. LAKSHADWEEP (Union Territory 7)
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'lakshadweep',
      name: 'Lakshadweep',
      code: 'LD',
      isUt: true,
      isOperational: false,
      coordinates: [10.5667, 72.6417],
      districts: [
        {
          id: 'lakshadweep_dist',
          name: 'Lakshadweep',
          isOperational: false,
          coordinates: [10.5667, 72.6417],
          cities: [
            { id: 'kavaratti', name: 'Kavaratti', isOperational: false },
            { id: 'agatti', name: 'Agatti', isOperational: false },
            { id: 'minicoy', name: 'Minicoy', isOperational: false },
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 36. PUDUCHERRY (Union Territory 8)
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'puducherry',
      name: 'Puducherry',
      code: 'PY',
      isUt: true,
      isOperational: false,
      coordinates: [11.9416, 79.8083],
      districts: [
        {
          id: 'puducherry_dist',
          name: 'Puducherry',
          isOperational: false,
          coordinates: [11.9416, 79.8083],
          cities: [
            { id: 'puducherry_town', name: 'Puducherry', isOperational: false },
            { id: 'ozhukarai', name: 'Ozhukarai', isOperational: false },
          ],
        },
        {
          id: 'karaikal',
          name: 'Karaikal',
          isOperational: false,
          coordinates: [10.9254, 79.838],
          cities: [
            { id: 'karaikal_town', name: 'Karaikal', isOperational: false },
          ],
        },
        {
          id: 'mahe',
          name: 'Mahe',
          isOperational: false,
          coordinates: [11.7002, 75.5343],
          cities: [
            { id: 'mahe_town', name: 'Mahe', isOperational: false },
          ],
        },
        {
          id: 'yanam',
          name: 'Yanam',
          isOperational: false,
          coordinates: [16.7333, 82.2167],
          cities: [
            { id: 'yanam_town', name: 'Yanam', isOperational: false },
          ],
        },
      ],
    },
  ],
};

// ═════════════════════════════════════════════════════════════════════════════
// HELPER LOOKUP FUNCTIONS
// ═════════════════════════════════════════════════════════════════════════════

export function getAvailableStates(): StateInfo[] {
  return INDIA_LOCATION_DATA.states;
}

export function getDistrictsForState(stateNameOrId: string): DistrictInfo[] {
  if (!stateNameOrId) return [];
  const state = INDIA_LOCATION_DATA.states.find(
    (s) => s.name.toLowerCase() === stateNameOrId.toLowerCase() || s.id === stateNameOrId.toLowerCase()
  );
  return state ? state.districts : [];
}

export function getCitiesForDistrict(stateNameOrId: string, districtNameOrId: string): CityTown[] {
  if (!stateNameOrId || !districtNameOrId) return [];
  const districts = getDistrictsForState(stateNameOrId);
  const district = districts.find(
    (d) => d.name.toLowerCase() === districtNameOrId.toLowerCase() || d.id === districtNameOrId.toLowerCase()
  );
  return district ? district.cities : [];
}

/**
 * Strict CivicPulse Operational Scoping:
 * ONLY Tamil Nadu -> Chennai is operational.
 * All other locations explicitly return false to prevent data corruption or fabricated scores.
 */
export function isLocationOperational(stateName?: string, districtName?: string, cityName?: string): boolean {
  if (!stateName || stateName.toLowerCase() !== 'tamil nadu') return false;
  if (!districtName || districtName.toLowerCase() !== 'chennai') return false;
  return true;
}

/**
 * Global Search index lookup supporting India, State, District, City / Town.
 * Returns exact hierarchy paths so selection can immediately set State, District, and City.
 */
export function searchAllLocations(query: string, limit = 10): SearchableLocation[] {
  const q = query.trim().toLowerCase();
  if (!q || q.length < 2) return [];

  const results: SearchableLocation[] = [];

  // 1. Check Country
  if ('india'.includes(q)) {
    results.push({
      label: '🇮🇳 India (Country)',
      name: 'India',
      type: 'country',
      country: 'India',
      state: 'Tamil Nadu',
      district: 'Chennai',
      city: 'Chennai',
      coordinates: [78.9629, 20.5937],
      isOperational: false,
      level: 5,
    });
  }

  // 2. Iterate States, Districts, and Cities
  for (const s of INDIA_LOCATION_DATA.states) {
    const stateMatches = s.name.toLowerCase().includes(q) || s.code.toLowerCase() === q;
    if (stateMatches) {
      const defaultDist = s.districts[0]?.name || '';
      const defaultCity = s.districts[0]?.cities[0]?.name || '';
      results.push({
        label: `${s.isUt ? 'Union Territory' : 'State'}: ${s.name}`,
        name: s.name,
        type: 'state',
        country: 'India',
        state: s.name,
        district: defaultDist,
        city: defaultCity,
        coordinates: [s.coordinates[1], s.coordinates[0]], // [lon, lat]
        isOperational: s.name.toLowerCase() === 'tamil nadu',
        level: 7,
      });
    }

    for (const d of s.districts) {
      const distMatches = d.name.toLowerCase().includes(q);
      if (distMatches) {
        const defaultCity = d.cities[0]?.name || '';
        results.push({
          label: `District: ${d.name} (${s.name})`,
          name: d.name,
          type: 'district',
          country: 'India',
          state: s.name,
          district: d.name,
          city: defaultCity,
          coordinates: [d.coordinates[1], d.coordinates[0]],
          isOperational: s.name.toLowerCase() === 'tamil nadu' && d.name.toLowerCase() === 'chennai',
          level: 10,
        });
      }

      for (const c of d.cities) {
        const cityMatches = c.name.toLowerCase().includes(q);
        if (cityMatches && !distMatches) {
          const coords = c.coordinates ? [c.coordinates[1], c.coordinates[0]] : [d.coordinates[1], d.coordinates[0]];
          results.push({
            label: `City/Town: ${c.name} (${d.name}, ${s.name})`,
            name: c.name,
            type: 'city',
            country: 'India',
            state: s.name,
            district: d.name,
            city: c.name,
            coordinates: coords as [number, number],
            isOperational: s.name.toLowerCase() === 'tamil nadu' && d.name.toLowerCase() === 'chennai',
            level: 12,
          });
        }
      }
    }
  }

  // De-duplicate by label
  const seen = new Set<string>();
  const unique = results.filter((item) => {
    if (seen.has(item.label)) return false;
    seen.add(item.label);
    return true;
  });

  return unique.slice(0, limit);
}
