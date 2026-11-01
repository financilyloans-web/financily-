/**
 * Indian pincode reference dataset (6-digit postal codes).
 *
 * Provides a broad, curated coverage across all states and union territories
 * so the address form can autofill city/state from a pincode and offer a
 * searchable suggestion list via a <datalist>.
 */

export interface PinEntry {
  p: string;
  city: string;
  state: string;
}

type Row = { city: string; state: string; pins: string[] };

/** Expand "000001-000010" style ranges plus single codes into a list. */
function expand(pins: string[]): string[] {
  const out: string[] = [];
  for (const p of pins) {
    if (p.includes("-")) {
      const [a, b] = p.split("-").map(Number);
      for (let i = a; i <= b; i++) out.push(String(i).padStart(6, "0"));
    } else {
      out.push(p);
    }
  }
  return out;
}

const ROWS: Row[] = [
  // ── Maharashtra ───────────────────────────────────────────────
  { city: "Mumbai", state: "Maharashtra", pins: ["400001-400104"] },
  { city: "Pune", state: "Maharashtra", pins: ["411001-411062"] },
  { city: "Nagpur", state: "Maharashtra", pins: ["440001-440037"] },
  { city: "Nashik", state: "Maharashtra", pins: ["422001-422010"] },
  { city: "Aurangabad", state: "Maharashtra", pins: ["431001-431136"] },
  { city: "Thane", state: "Maharashtra", pins: ["400601-400615"] },
  { city: "Navi Mumbai", state: "Maharashtra", pins: ["400701-400709"] },
  { city: "Kolhapur", state: "Maharashtra", pins: ["416001-416012"] },
  { city: "Solapur", state: "Maharashtra", pins: ["413001-413007"] },
  { city: "Amravati", state: "Maharashtra", pins: ["444601-444607"] },
  { city: "Jalgaon", state: "Maharashtra", pins: ["425001-425003"] },
  { city: "Sangli", state: "Maharashtra", pins: ["416416", "416410"] },
  { city: "Satara", state: "Maharashtra", pins: ["415001-415002"] },
  { city: "Ratnagiri", state: "Maharashtra", pins: ["415612", "415639"] },
  { city: "Akola", state: "Maharashtra", pins: ["444001-444004"] },
  // ── Delhi ─────────────────────────────────────────────────────
  { city: "New Delhi", state: "Delhi", pins: ["110001-110096"] },
  // ── Gujarat ───────────────────────────────────────────────────
  { city: "Ahmedabad", state: "Gujarat", pins: ["380001-380060", "382480"] },
  { city: "Surat", state: "Gujarat", pins: ["395001-395010"] },
  { city: "Vadodara", state: "Gujarat", pins: ["390001-390023"] },
  { city: "Rajkot", state: "Gujarat", pins: ["360001-360007"] },
  { city: "Gandhinagar", state: "Gujarat", pins: ["382010-382021"] },
  { city: "Bhavnagar", state: "Gujarat", pins: ["364001-364002"] },
  { city: "Jamnagar", state: "Gujarat", pins: ["361001-361008"] },
  { city: "Anand", state: "Gujarat", pins: ["388001"] },
  { city: "Mehsana", state: "Gujarat", pins: ["384001"] },
  // ── Karnataka ─────────────────────────────────────────────────
  { city: "Bengaluru", state: "Karnataka", pins: ["560001-560103"] },
  { city: "Mysuru", state: "Karnataka", pins: ["570001-570032"] },
  { city: "Hubballi", state: "Karnataka", pins: ["580001-580032"] },
  { city: "Mangaluru", state: "Karnataka", pins: ["575001-575030"] },
  { city: "Belagavi", state: "Karnataka", pins: ["590001-590010"] },
  { city: "Kalaburagi", state: "Karnataka", pins: ["585101-585106"] },
  { city: "Davanagere", state: "Karnataka", pins: ["577001-577006"] },
  { city: "Tumakuru", state: "Karnataka", pins: ["572101-572103"] },
  { city: "Ballari", state: "Karnataka", pins: ["583101-583103"] },
  // ── Tamil Nadu ────────────────────────────────────────────────
  { city: "Chennai", state: "Tamil Nadu", pins: ["600001-600100"] },
  { city: "Coimbatore", state: "Tamil Nadu", pins: ["641001-641062"] },
  { city: "Madurai", state: "Tamil Nadu", pins: ["625001-625020"] },
  { city: "Tiruchirappalli", state: "Tamil Nadu", pins: ["620001-620025"] },
  { city: "Salem", state: "Tamil Nadu", pins: ["636001-636016"] },
  { city: "Tirunelveli", state: "Tamil Nadu", pins: ["627001-627012"] },
  { city: "Vellore", state: "Tamil Nadu", pins: ["632001-632009"] },
  { city: "Erode", state: "Tamil Nadu", pins: ["638001-638012"] },
  { city: "Thanjavur", state: "Tamil Nadu", pins: ["613001-613009"] },
  { city: "Nagercoil", state: "Tamil Nadu", pins: ["629001-629005"] },
  // ── Telangana ─────────────────────────────────────────────────
  { city: "Hyderabad", state: "Telangana", pins: ["500001-500097"] },
  { city: "Secunderabad", state: "Telangana", pins: ["500003", "500015"] },
  { city: "Warangal", state: "Telangana", pins: ["506001-506013"] },
  { city: "Nizamabad", state: "Telangana", pins: ["503001-503003"] },
  { city: "Karimnagar", state: "Telangana", pins: ["505001-505003"] },
  { city: "Khammam", state: "Telangana", pins: ["507001-507004"] },
  // ── Andhra Pradesh ────────────────────────────────────────────
  { city: "Visakhapatnam", state: "Andhra Pradesh", pins: ["530001-530053"] },
  { city: "Vijayawada", state: "Andhra Pradesh", pins: ["520001-520015"] },
  { city: "Guntur", state: "Andhra Pradesh", pins: ["522001-522007"] },
  { city: "Nellore", state: "Andhra Pradesh", pins: ["524001-524005"] },
  { city: "Tirupati", state: "Andhra Pradesh", pins: ["517501-517507"] },
  { city: "Kurnool", state: "Andhra Pradesh", pins: ["518001-518006"] },
  { city: "Rajahmundry", state: "Andhra Pradesh", pins: ["533101-533107"] },
  { city: "Kadapa", state: "Andhra Pradesh", pins: ["516001-516004"] },
  // ── West Bengal ───────────────────────────────────────────────
  { city: "Kolkata", state: "West Bengal", pins: ["700001-700160"] },
  { city: "Howrah", state: "West Bengal", pins: ["711101-711114"] },
  { city: "Siliguri", state: "West Bengal", pins: ["734001-734406"] },
  { city: "Durgapur", state: "West Bengal", pins: ["713201-713217"] },
  { city: "Asansol", state: "West Bengal", pins: ["713301-713304"] },
  // ── Uttar Pradesh ─────────────────────────────────────────────
  { city: "Lucknow", state: "Uttar Pradesh", pins: ["226001-226029"] },
  { city: "Kanpur", state: "Uttar Pradesh", pins: ["208001-208027"] },
  { city: "Varanasi", state: "Uttar Pradesh", pins: ["221001-221011"] },
  { city: "Agra", state: "Uttar Pradesh", pins: ["282001-282010"] },
  { city: "Meerut", state: "Uttar Pradesh", pins: ["250001-250004"] },
  { city: "Prayagraj", state: "Uttar Pradesh", pins: ["211001-211019"] },
  { city: "Ghaziabad", state: "Uttar Pradesh", pins: ["201001-201014"] },
  { city: "Noida", state: "Uttar Pradesh", pins: ["201301-201310"] },
  { city: "Gorakhpur", state: "Uttar Pradesh", pins: ["273001-273016"] },
  { city: "Aligarh", state: "Uttar Pradesh", pins: ["202001-202002"] },
  { city: "Mathura", state: "Uttar Pradesh", pins: ["281001-281004", "281121"] },
  { city: "Jhansi", state: "Uttar Pradesh", pins: ["284001-284003"] },
  { city: "Bareilly", state: "Uttar Pradesh", pins: ["243001-243006"] },
  { city: "Moradabad", state: "Uttar Pradesh", pins: ["244001-244003"] },
  // ── Rajasthan ─────────────────────────────────────────────────
  { city: "Jaipur", state: "Rajasthan", pins: ["302001-302041"] },
  { city: "Jodhpur", state: "Rajasthan", pins: ["342001-342011"] },
  { city: "Udaipur", state: "Rajasthan", pins: ["313001-313024"] },
  { city: "Kota", state: "Rajasthan", pins: ["324001-324009"] },
  { city: "Ajmer", state: "Rajasthan", pins: ["305001-305009"] },
  { city: "Bikaner", state: "Rajasthan", pins: ["334001-334006"] },
  { city: "Alwar", state: "Rajasthan", pins: ["301001-301002"] },
  { city: "Bharatpur", state: "Rajasthan", pins: ["321001-321004"] },
  { city: "Sikar", state: "Rajasthan", pins: ["332001-332002"] },
  // ── Madhya Pradesh ────────────────────────────────────────────
  { city: "Bhopal", state: "Madhya Pradesh", pins: ["462001-462048"] },
  { city: "Indore", state: "Madhya Pradesh", pins: ["452001-452020"] },
  { city: "Jabalpur", state: "Madhya Pradesh", pins: ["482001-482021"] },
  { city: "Gwalior", state: "Madhya Pradesh", pins: ["474001-474017"] },
  { city: "Ujjain", state: "Madhya Pradesh", pins: ["456001-456010"] },
  { city: "Sagar", state: "Madhya Pradesh", pins: ["470001-470004"] },
  { city: "Rewa", state: "Madhya Pradesh", pins: ["486001-486003"] },
  { city: "Ratlam", state: "Madhya Pradesh", pins: ["457001-457002"] },
  // ── Bihar ─────────────────────────────────────────────────────
  { city: "Patna", state: "Bihar", pins: ["800001-800030"] },
  { city: "Gaya", state: "Bihar", pins: ["823001-823004"] },
  { city: "Bhagalpur", state: "Bihar", pins: ["812001-812007"] },
  { city: "Muzaffarpur", state: "Bihar", pins: ["842001-842005"] },
  { city: "Darbhanga", state: "Bihar", pins: ["846001-846009"] },
  { city: "Purnia", state: "Bihar", pins: ["854301-854303"] },
  { city: "Begusarai", state: "Bihar", pins: ["851101-851129"] },
  { city: "Siwan", state: "Bihar", pins: ["841226-841227"] },
  // ── Punjab ────────────────────────────────────────────────────
  { city: "Ludhiana", state: "Punjab", pins: ["141001-141021"] },
  { city: "Amritsar", state: "Punjab", pins: ["143001-143026"] },
  { city: "Jalandhar", state: "Punjab", pins: ["144001-144041"] },
  { city: "Patiala", state: "Punjab", pins: ["147001-147011"] },
  { city: "Bathinda", state: "Punjab", pins: ["151001-151005"] },
  { city: "Mohali", state: "Punjab", pins: ["160055-160071"] },
  { city: "Chandigarh", state: "Chandigarh", pins: ["160001-160103"] },
  // ── Haryana ───────────────────────────────────────────────────
  { city: "Gurugram", state: "Haryana", pins: ["122001-122022"] },
  { city: "Faridabad", state: "Haryana", pins: ["121001-121013"] },
  { city: "Panipat", state: "Haryana", pins: ["132103-132116"] },
  { city: "Ambala", state: "Haryana", pins: ["133001-134203"] },
  { city: "Karnal", state: "Haryana", pins: ["132001-132116"] },
  { city: "Rohtak", state: "Haryana", pins: ["124001-124021"] },
  { city: "Hisar", state: "Haryana", pins: ["125001-125044"] },
  { city: "Sonipat", state: "Haryana", pins: ["131001-131030"] },
  // ── Odisha ────────────────────────────────────────────────────
  { city: "Bhubaneswar", state: "Odisha", pins: ["751001-751030"] },
  { city: "Cuttack", state: "Odisha", pins: ["753001-753014"] },
  { city: "Rourkela", state: "Odisha", pins: ["769001-769042"] },
  { city: "Berhampur", state: "Odisha", pins: ["760001-760010"] },
  { city: "Puri", state: "Odisha", pins: ["752001-752063"] },
  { city: "Sambalpur", state: "Odisha", pins: ["768001-768006"] },
  // ── Kerala ────────────────────────────────────────────────────
  { city: "Thiruvananthapuram", state: "Kerala", pins: ["695001-695035"] },
  { city: "Kochi", state: "Kerala", pins: ["682001-682038"] },
  { city: "Kozhikode", state: "Kerala", pins: ["673001-673032"] },
  { city: "Thrissur", state: "Kerala", pins: ["680001-680022"] },
  { city: "Kollam", state: "Kerala", pins: ["691001-691014"] },
  { city: "Kannur", state: "Kerala", pins: ["670001-670017"] },
  { city: "Alappuzha", state: "Kerala", pins: ["688001-688013"] },
  { city: "Palakkad", state: "Kerala", pins: ["678001-678013"] },
  // ── Assam ─────────────────────────────────────────────────────
  { city: "Guwahati", state: "Assam", pins: ["781001-781040"] },
  { city: "Dibrugarh", state: "Assam", pins: ["786001-786008"] },
  { city: "Silchar", state: "Assam", pins: ["788001-788013"] },
  { city: "Jorhat", state: "Assam", pins: ["785001-785006"] },
  { city: "Tezpur", state: "Assam", pins: ["784001-784002"] },
  { city: "Nagaon", state: "Assam", pins: ["782001"] },
  // ── Chhattisgarh ──────────────────────────────────────────────
  { city: "Raipur", state: "Chhattisgarh", pins: ["492001-492018"] },
  { city: "Bhilai", state: "Chhattisgarh", pins: ["490001-490023"] },
  { city: "Bilaspur", state: "Chhattisgarh", pins: ["495001-495010"] },
  { city: "Korba", state: "Chhattisgarh", pins: ["495677-495681"] },
  { city: "Durg", state: "Chhattisgarh", pins: ["491001-491107"] },
  // ── Jharkhand ─────────────────────────────────────────────────
  { city: "Ranchi", state: "Jharkhand", pins: ["834001-834012"] },
  { city: "Jamshedpur", state: "Jharkhand", pins: ["831001-831017"] },
  { city: "Dhanbad", state: "Jharkhand", pins: ["826001-826015"] },
  { city: "Bokaro", state: "Jharkhand", pins: ["827001-827013"] },
  { city: "Hazaribagh", state: "Jharkhand", pins: ["825301-825306"] },
  // ── Goa ───────────────────────────────────────────────────────
  { city: "Panaji", state: "Goa", pins: ["403001-403009"] },
  { city: "Margao", state: "Goa", pins: ["403601-403602"] },
  { city: "Vasco da Gama", state: "Goa", pins: ["403801-403803"] },
  // ── North East ────────────────────────────────────────────────
  { city: "Shillong", state: "Meghalaya", pins: ["793001-793016"] },
  { city: "Imphal", state: "Manipur", pins: ["795001-795010"] },
  { city: "Agartala", state: "Tripura", pins: ["799001-799007"] },
  { city: "Kohima", state: "Nagaland", pins: ["797001-797112"] },
  { city: "Dimapur", state: "Nagaland", pins: ["797112-797115"] },
  { city: "Aizawl", state: "Mizoram", pins: ["796001-796009"] },
  { city: "Itanagar", state: "Arunachal Pradesh", pins: ["791111-791113"] },
  { city: "Gangtok", state: "Sikkim", pins: ["737101-737135"] },
  // ── Uttarakhand ───────────────────────────────────────────────
  { city: "Dehradun", state: "Uttarakhand", pins: ["248001-248171"] },
  { city: "Haridwar", state: "Uttarakhand", pins: ["249401-249408"] },
  { city: "Nainital", state: "Uttarakhand", pins: ["263001-263139"] },
  { city: "Rishikesh", state: "Uttarakhand", pins: ["249201-249204"] },
  { city: "Haldwani", state: "Uttarakhand", pins: ["263139-263146"] },
  // ── Himachal Pradesh ──────────────────────────────────────────
  { city: "Shimla", state: "Himachal Pradesh", pins: ["171001-171009"] },
  { city: "Manali", state: "Himachal Pradesh", pins: ["175131-175133"] },
  { city: "Dharamshala", state: "Himachal Pradesh", pins: ["176215-176216"] },
  { city: "Solan", state: "Himachal Pradesh", pins: ["173212-173213"] },
  // ── Jammu & Kashmir / Ladakh ──────────────────────────────────
  { city: "Srinagar", state: "Jammu & Kashmir", pins: ["190001-190025"] },
  { city: "Jammu", state: "Jammu & Kashmir", pins: ["180001-180020"] },
  { city: "Leh", state: "Ladakh", pins: ["194101-194105"] },
  { city: "Kargil", state: "Ladakh", pins: ["194103"] },
  // ── Union Territories ─────────────────────────────────────────
  { city: "Puducherry", state: "Puducherry", pins: ["605001-605014"] },
  { city: "Port Blair", state: "Andaman & Nicobar", pins: ["744101-744302"] },
  { city: "Daman", state: "Daman & Diu", pins: ["396210-396215"] },
  { city: "Silvassa", state: "Dadra & Nagar Haveli", pins: ["396230-396240"] },
  { city: "Kavaratti", state: "Lakshadweep", pins: ["682555", "682552", "682553"] },
];

export const PINCodes: PinEntry[] = (() => {
  const seen = new Set<string>();
  const out: PinEntry[] = [];
  for (const r of ROWS) {
    for (const p of expand(r.pins)) {
      if (seen.has(p)) continue; // keep the first occurrence for a pincode
      seen.add(p);
      out.push({ p, city: r.city, state: r.state });
    }
  }
  return out;
})();

export function findByPincode(code: string): PinEntry | undefined {
  return PINCodes.find((e) => e.p === code);
}

/** Group by state for filtering controls if needed. */
export const PIN_STATES: string[] = Array.from(
  new Set(PINCodes.map((e) => e.state)),
).sort();
