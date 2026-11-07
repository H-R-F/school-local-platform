import { employeesRepository } from "./employees";
import { studentsRepository } from "./students";

export type VehicleStatus = "Disponible" | "Affecté" | "En maintenance" | "Hors service";
export type RouteStatus = "Actif" | "Inactif";
export type RegistrationStatus = "Actif" | "Suspendu" | "Terminé";
export interface TransportVehicle { id:string; registration:string; make:string; model:string; type:string; capacity:number; status:VehicleStatus; notes:string; createdAt:string }
export interface TransportStop { id:string; name:string; location:string; arrivalTime:string }
export interface TransportRoute { id:string; name:string; code:string; description:string; stopIds:string[]; vehicleId:string|null; driverId:string|null; status:RouteStatus; createdAt:string }
export interface TransportDriver { id:string; employeeId:string; status:"Disponible"|"Affecté"; createdAt:string }
export interface TransportRegistration { id:string; studentId:string; academicYearId:string; routeId:string; pickupStopId:string; dropoffStopId:string|null; status:RegistrationStatus; registeredAt:string; }
export interface TransportData { vehicles:TransportVehicle[]; routes:TransportRoute[]; stops:TransportStop[]; drivers:TransportDriver[]; registrations:TransportRegistration[]; students:Awaited<ReturnType<typeof studentsRepository.list>>["students"]; employees:Awaited<ReturnType<typeof employeesRepository.list>>["employees"]; }
const KEY="school-platform-transport-v1";
type Stored=Pick<TransportData,"vehicles"|"routes"|"stops"|"drivers"|"registrations">;
const seed:Stored={
 vehicles:[
  {id:"VEH-001",registration:"12345-A-6",make:"Mercedes-Benz",model:"Sprinter",type:"Minibus",capacity:18,status:"Affecté",notes:"Véhicule de démonstration",createdAt:"2026-09-01"},
  {id:"VEH-002",registration:"23456-B-6",make:"Iveco",model:"Daily",type:"Autocar",capacity:30,status:"Affecté",notes:"Véhicule de démonstration",createdAt:"2026-09-01"},
  {id:"VEH-003",registration:"34567-C-6",make:"Renault",model:"Master",type:"Minibus",capacity:15,status:"Disponible",notes:"Véhicule de démonstration",createdAt:"2026-09-01"},
  {id:"VEH-004",registration:"45678-D-6",make:"Ford",model:"Transit",type:"Minibus",capacity:12,status:"En maintenance",notes:"Exemple illustratif",createdAt:"2026-09-01"}
 ],
 stops:[
  {id:"STOP-01",name:"Place des Nations Unies",location:"Centre-ville, Casablanca",arrivalTime:"07:10"},
  {id:"STOP-02",name:"Maarif",location:"Boulevard Bir Anzarane, Casablanca",arrivalTime:"07:25"},
  {id:"STOP-03",name:"Californie",location:"Quartier Californie, Casablanca",arrivalTime:"07:45"},
  {id:"STOP-04",name:"Sidi Maarouf",location:"Technopark, Casablanca",arrivalTime:"07:55"},
  {id:"STOP-05",name:"Aïn Sebaâ",location:"Boulevard Chefchaouni, Casablanca",arrivalTime:"07:20"},
  {id:"STOP-06",name:"Hay Mohammadi",location:"Hay Mohammadi, Casablanca",arrivalTime:"07:35"}
 ],
 routes:[
  {id:"ROU-01",name:"Circuit Centre-ville",code:"CIR-01",description:"Desserte du centre-ville et du quartier Maarif.",stopIds:["STOP-01","STOP-02"],vehicleId:"VEH-001",driverId:null,status:"Actif",createdAt:"2026-09-01"},
  {id:"ROU-02",name:"Circuit Californie",code:"CIR-02",description:"Desserte du quartier Californie.",stopIds:["STOP-03","STOP-04"],vehicleId:"VEH-002",driverId:null,status:"Actif",createdAt:"2026-09-01"},
  {id:"ROU-03",name:"Circuit Aïn Sebaâ",code:"CIR-03",description:"Desserte du secteur Aïn Sebaâ et Hay Mohammadi.",stopIds:["STOP-05","STOP-06"],vehicleId:null,driverId:null,status:"Actif",createdAt:"2026-09-01"}
 ],
 drivers:[],
 registrations:[]
};
function read():Stored {
 try { const raw=localStorage.getItem(KEY); if(!raw){localStorage.setItem(KEY,JSON.stringify(seed));return structuredClone(seed);} const value=JSON.parse(raw) as Stored; if(!value||!Array.isArray(value.vehicles)||!Array.isArray(value.routes)||!Array.isArray(value.stops)||!Array.isArray(value.drivers)||!Array.isArray(value.registrations))throw new Error();return value; }
 catch { throw new Error("Impossible de charger les données de transport depuis ce navigateur."); }
}
function write(data:Stored):Stored { try{localStorage.setItem(KEY,JSON.stringify(data));return data;}catch{throw new Error("Enregistrement local impossible. Vérifiez l’espace disponible dans le navigateur.");} }
function routeOccupancy(data:Stored,routeId:string){return data.registrations.filter(r=>r.routeId===routeId&&r.status==="Actif").length;}
function validateCapacity(data:Stored,routeId:string,vehicleId:string|null){if(!vehicleId)return;const vehicle=data.vehicles.find(v=>v.id===vehicleId);if(!vehicle)throw new Error("Le véhicule sélectionné n’existe plus.");if(vehicle.status==="En maintenance"||vehicle.status==="Hors service")throw new Error("Ce véhicule n’est pas disponible pour une affectation.");const currentRoute=data.routes.find(r=>r.vehicleId===vehicleId&&r.id!==routeId&&r.status==="Actif");if(currentRoute)throw new Error("Ce véhicule est déjà affecté à un autre circuit actif.");if(routeOccupancy(data,routeId)>vehicle.capacity)throw new Error("La capacité du véhicule est inférieure au nombre d’élèves inscrits sur ce circuit.");}
export const transportRepository={
 async list():Promise<TransportData>{const [students,employees]=await Promise.all([studentsRepository.list(),employeesRepository.list()]);const data=read();return {...data,students:students.students,employees:employees.employees};},
 async saveVehicle(input:Omit<TransportVehicle,"id"|"createdAt">,id?:string){const data=read();if(!input.registration.trim()||!Number.isInteger(input.capacity)||input.capacity<=0)throw new Error("Renseignez une immatriculation et une capacité entière positive.");if(data.vehicles.some(v=>v.id!==id&&v.registration.toUpperCase()===input.registration.trim().toUpperCase()))throw new Error("Cette immatriculation existe déjà.");const current=data.vehicles.find(v=>v.id===id);const value:TransportVehicle={...(current??{id:"VEH-"+Date.now(),createdAt:new Date().toISOString()}),...input,registration:input.registration.trim().toUpperCase()};if(value.status==="En maintenance"||value.status==="Hors service"){const linked=data.routes.filter(r=>r.vehicleId===value.id&&r.status==="Actif");if(linked.length)throw new Error("Retirez d’abord ce véhicule des circuits actifs.");}write({...data,vehicles:current?data.vehicles.map(v=>v.id===id?value:v):[value,...data.vehicles]});return this.list();},
 async saveRoute(input:Omit<TransportRoute,"id"|"createdAt">,id?:string){const data=read();if(!input.name.trim()||!input.stopIds.length)throw new Error("Le nom du circuit et au moins un arrêt sont obligatoires.");if(input.stopIds.some(s=>!data.stops.some(x=>x.id===s)))throw new Error("Un arrêt sélectionné n’appartient plus à la liste des arrêts.");if(data.routes.some(r=>r.id!==id&&input.code&&r.code.toUpperCase()===input.code.trim().toUpperCase()))throw new Error("Cette référence de circuit existe déjà.");if(input.vehicleId)validateCapacity(data,id??"",input.vehicleId);if(input.driverId){const driver=data.drivers.find(d=>d.id===input.driverId);if(!driver)throw new Error("Le chauffeur sélectionné n’existe plus.");if(data.routes.some(r=>r.id!==id&&r.status==="Actif"&&r.driverId===input.driverId))throw new Error("Ce chauffeur est déjà affecté à un autre circuit actif.");}const current=data.routes.find(r=>r.id===id);const value:TransportRoute={...(current??{id:"ROU-"+Date.now(),createdAt:new Date().toISOString()}),...input,name:input.name.trim(),code:input.code.trim().toUpperCase()};write({...data,routes:current?data.routes.map(r=>r.id===id?value:r):[value,...data.routes]});return this.list();},
 async saveDriver(employeeId:string,id?:string){const data=read();if(!employeeId||!data.drivers.every(d=>d.employeeId!==employeeId||d.id===id))throw new Error("Cet employé possède déjà un profil chauffeur.");if(!data.drivers.some(d=>d.id===id)&&!data.drivers.some(d=>d.employeeId===employeeId)){write({...data,drivers:[{id:"DRV-"+Date.now(),employeeId,status:"Disponible",createdAt:new Date().toISOString()},...data.drivers]});}return this.list();},
 async saveRegistration(input:Omit<TransportRegistration,"id">,id?:string){const data=read();if(data.registrations.some(r=>r.id!==id&&r.studentId===input.studentId&&r.status==="Actif"))throw new Error("Cet élève possède déjà une inscription de transport active.");const student= (await studentsRepository.list()).students.find(s=>s.id===input.studentId);if(!student||student.enrollment?.status!=="Actif")throw new Error("Seuls les élèves ayant une inscription scolaire active peuvent être inscrits au transport.");const route=data.routes.find(r=>r.id===input.routeId&&r.status==="Actif");if(!route)throw new Error("Sélectionnez un circuit actif.");if(!route.stopIds.includes(input.pickupStopId)||input.dropoffStopId&&!route.stopIds.includes(input.dropoffStopId))throw new Error("Les arrêts doivent appartenir au circuit sélectionné.");const current=data.registrations.find(r=>r.id===id);const count=data.registrations.filter(r=>r.routeId===input.routeId&&r.status==="Actif"&&r.id!==id).length;if(route.vehicleId){const vehicle=data.vehicles.find(v=>v.id===route.vehicleId);if(!vehicle||vehicle.status==="En maintenance"||vehicle.status==="Hors service")throw new Error("Le véhicule du circuit n’est pas disponible.");if(count>=vehicle.capacity)throw new Error("La capacité du véhicule est atteinte. Inscription impossible.");}const value:TransportRegistration={...(current??{id:"INS-"+Date.now()}),...input};write({...data,registrations:current?data.registrations.map(r=>r.id===id?value:r):[value,...data.registrations]});return this.list();},
 async updateRegistrationStatus(id:string,status:RegistrationStatus){const data=read();if(!data.registrations.some(r=>r.id===id))throw new Error("Inscription introuvable.");write({...data,registrations:data.registrations.map(r=>r.id===id?{...r,status}:r)});return this.list();},
 async saveStop(input:Omit<TransportStop,"id">,id?:string){const data=read();if(!input.name.trim()||!input.location.trim())throw new Error("Le nom et la localisation de l’arrêt sont obligatoires.");const current=data.stops.find(s=>s.id===id);const value:TransportStop={...(current??{id:"STOP-"+Date.now()}),...input,name:input.name.trim(),location:input.location.trim()};write({...data,stops:current?data.stops.map(s=>s.id===id?value:s):[value,...data.stops]});return this.list();},
};
