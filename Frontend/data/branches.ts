export interface Branch {
  id: string;
  name: string;
  shortName: string;
  address: string;
  lat: number;
  lng: number;
  phone?: string;
  hours: string;
}

const branches: Branch[] = [
  {
    id: 'utc',
    name: 'Simba Supermarket UTC (Main Branch)',
    shortName: 'UTC – Main Branch',
    address: 'Union Trade Centre (UTC), 1 KN 4 Ave, Kigali',
    lat: -1.9498,
    lng: 30.0596,
    phone: '+250 784 686 026',
    hours: 'Mon–Sun: 7:00 AM – 9:00 PM',
  },
  {
    id: 'kimironko',
    name: 'Simba Supermarket Kimironko',
    shortName: 'Kimironko',
    address: 'KG 192 St, Kimironko, Kigali',
    lat: -1.9365,
    lng: 30.1076,
    phone: '+250 788 300 000',
    hours: 'Mon–Sun: 7:00 AM – 9:00 PM',
  },
  {
    id: 'kigali-heights',
    name: 'Simba Supermarket Kigali Heights',
    shortName: 'Kigali Heights',
    address: 'KG 541 St, Kigali Heights, Kigali',
    lat: -1.9323,
    lng: 30.0892,
    phone: '+250 788 300 000',
    hours: 'Mon–Sun: 7:00 AM – 9:00 PM',
  },
  {
    id: 'gishushu',
    name: 'Simba Supermarket Gishushu',
    shortName: 'Gishushu',
    address: 'KN 5 Rd, Gishushu, Kigali',
    lat: -1.9452,
    lng: 30.0714,
    phone: '+250 788 300 000',
    hours: 'Mon–Sun: 7:00 AM – 9:00 PM',
  },
  {
    id: 'kicukiro',
    name: 'Simba Supermarket Kicukiro',
    shortName: 'Kicukiro',
    address: 'Kicukiro, Kigali',
    lat: -1.9886,
    lng: 30.0724,
    phone: '+250 788 300 000',
    hours: 'Mon–Sun: 7:00 AM – 9:00 PM',
  },
  {
    id: 'rebero',
    name: 'Simba Supermarket Rebero',
    shortName: 'Rebero',
    address: 'KK 35 Ave, Rebero, Kigali',
    lat: -1.9723,
    lng: 30.0892,
    phone: '+250 788 300 000',
    hours: 'Mon–Sun: 7:00 AM – 9:00 PM',
  },
  {
    id: 'kisementi',
    name: 'Simba Supermarket Kisementi',
    shortName: 'Kisementi',
    address: 'Kisementi, Kigali',
    lat: -1.9412,
    lng: 30.0823,
    phone: '+250 788 300 000',
    hours: 'Mon–Sun: 7:00 AM – 9:00 PM',
  },
  {
    id: 'gikondo',
    name: 'Simba Supermarket Gikondo',
    shortName: 'Gikondo',
    address: 'KK 31 Ave, Gikondo, Kigali',
    lat: -1.9742,
    lng: 30.0598,
    phone: '+250 788 300 000',
    hours: 'Mon–Sun: 7:00 AM – 9:00 PM',
  },
  {
    id: 'nyamirambo',
    name: 'Simba Supermarket Nyamirambo',
    shortName: 'Nyamirambo',
    address: 'Nyamirambo, Kigali',
    lat: -1.9763,
    lng: 30.0437,
    phone: '+250 788 300 000',
    hours: 'Mon–Sun: 7:00 AM – 9:00 PM',
  },
];

export default branches;
