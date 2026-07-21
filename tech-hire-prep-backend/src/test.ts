
import dns from 'node:dns'
import { connectDB } from "./config/database.ts";
import { getSessionService } from './services/interviewSession.service.ts';
import { createWebrtcToken, getWebrtcRoomInfo, validateIceCandidate } from './services/webrtc.service.ts';
import { now} from './utils/date.utils.ts';

dns.setServers(['8.8.8.8', '1.1.1.1'])
await connectDB();

// const aa = await createWebrtcToken("6a58ca7c4435d4a25d8c56f8", "6a5a5c93245be9d0700ecf35")
// console.dir(aa, { depth: null });

// const bb = await getWebrtcRoomInfo("6a58ca7c4435d4a25d8c56f8", "6a5a5c93245be9d0700ecf35")
// console.dir(bb, {depth: null})

// const bbc = await validateIceCandidate("6a58ca7c4435d4a25d8c56f8", "6a5a5c93245be9d0700ecf35")
// console.dir(bbc, {depth: null})


// {
//   year: 2026,
//   month: 7,
//   day: 21,
//   hour: 12,
//   minute: 18,
//   second: 35,
//   millisecond: 323,
//   date: '2026-07-21',
//   time: '12:18:35.323',
//   utc: 2026-07-21T06:48:35.323Z,
//   iso: '2026-07-21T12:18:35.323+05:30',
//   istToUTC: undefined,
//   timestamp: 1784616515323
// }