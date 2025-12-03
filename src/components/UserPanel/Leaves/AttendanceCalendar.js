import React, { useEffect, useMemo, useState } from "react";
import { HiOutlineCalendar, HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import DayDetailPanel from "./OverAllComponent/DayDetailPanel";
import { useSelector } from "react-redux";
import { getAttendanceHistory } from "../../../api/ApiCalls";
import { toast } from "react-toastify";

const weekDays=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const START_HALF_DAY_HOUR=12, START_HALF_DAY_MIN=30;
const sOM=d=>{const x=new Date(d);x.setDate(1);x.setHours(0,0,0,0);return x};
const eOM=d=>{const x=new Date(d);x.setMonth(x.getMonth()+1);x.setDate(0);x.setHours(23,59,59,999);return x};
const minsToHHMM=m=>{const mins=Math.floor(m||0);return `${String(Math.floor(mins/60)).padStart(2,"0")}:${String(mins%60).padStart(2,"0")}`};
const formatISO=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

const getMonthMatrix=current=>{
  const y=current.getFullYear(), m=current.getMonth(), first=new Date(y,m,1), startDay=first.getDay(), rows=[];
  let d=1-startDay;
  for(let r=0;r<6;r++){const row=[];for(let c=0;c<7;c++){row.push({date:new Date(y,m,d++),inCurrentMonth:new Date(y,m,d-1).getMonth()===m});}rows.push(row)}
  return rows;
};

const calcSessionDuration=(session, isToday)=>{
  if(!session.checkIn) return 0;
  const checkInTime=new Date(session.checkIn);
  let checkOutTime;
  if(session.checkOut){
    checkOutTime=new Date(session.checkOut);
  }else if(isToday){
    checkOutTime=new Date();
  }else{
    checkOutTime=new Date(checkInTime);
    checkOutTime.setHours(23,59,59,999);
  }
  const breaks=session.breaks||[];
  const breakDuration=breaks.reduce((sum,br)=>{
    if(br.breakStartTime && br.breakEndTime){
      const bStart=new Date(br.breakStartTime);
      const bEnd=new Date(br.breakEndTime);
      return sum+(bEnd-bStart);
    }
    return sum;
  },0);
  const totalDuration=(checkOutTime-checkInTime)-breakDuration;
  return Math.max(0,totalDuration/(1000*60));
};

export default function AttendanceCalendar({ events=[], title, subtitle, legend=[] }) {
  const [current,setCurrent]=useState(new Date());
  const [selectedDate,setSelectedDate]=useState(null);
  const [selectedEvents,setSelectedEvents]=useState([]);
  const [employeeEvents,setEmployeeEvents]=useState([]);
  const [loading,setLoading]=useState(false);
  const [currentTime,setCurrentTime]=useState(new Date());
  const storeUser=useSelector(s=>s.auth.user);
  const userId=storeUser?.id||0;
  const matrix=useMemo(()=>getMonthMatrix(current),[current]);

  useEffect(()=>{
    const interval=setInterval(()=>setCurrentTime(new Date()),60000);
    return ()=>clearInterval(interval);
  },[]);

  useEffect(()=>{
    if(!userId){ setEmployeeEvents([]); return; }
    let m=true;
    (async()=>{
      setLoading(true);
      try{
        const resp=await getAttendanceHistory(userId, formatISO(sOM(current)), formatISO(eOM(current)));
        const days=Array.isArray(resp?.data?.data)?resp.data.data:[];
        const today=new Date();
        const todayStr=formatISO(today);
        
        const mapped=days.map(d=>{
          const sessions=d.sessions||[];
          const isToday=d.date===todayStr;
          
          let totalMins=0;
          sessions.forEach(s=>{
            totalMins+=calcSessionDuration(s,isToday);
          });

          const first=sessions[0];
          const firstIn=first?.checkIn?new Date(first.checkIn):null;
          let type="half-day";
          if(firstIn){ 
            const hr=firstIn.getHours(), mn=firstIn.getMinutes(); 
            if(hr>START_HALF_DAY_HOUR||(hr===START_HALF_DAY_HOUR&&mn>START_HALF_DAY_MIN)) type="half-day"; 
            else type="present"; 
          }
          
          const eight=8*60;
          const pct=Math.min(100,Math.round((totalMins/eight)*100));
          const hasRunningSession=sessions.some(s=>s.checkIn && !s.checkOut);
          const label=isToday && hasRunningSession?"Working":totalMins>0?`${(totalMins/60).toFixed(2)}h`:"Half Day";
          
          return { 
            date:d.date, 
            type, 
            label, 
            totalMinutes:totalMins, 
            pct, 
            sessions:sessions.map(s=>({...s,durationText:minsToHHMM(calcSessionDuration(s,isToday))})),
            isRunning:hasRunningSession,
            isToday
          };
        });
        if(m) setEmployeeEvents(mapped);
      }catch{ toast.error("Failed to load attendance history"); if(m) setEmployeeEvents([]); }
      finally{ if(m) setLoading(false); }
    })();
    return ()=>{ m=false; };
  },[current,userId,currentTime]);

  const combined = useMemo(()=>{
    const map={};
    events.forEach(e=>{ (map[e.date]||(map[e.date]=[])).push(e); });
    employeeEvents.forEach(e=>{ (map[e.date]||(map[e.date]=[])).push(e); });
    return map;
  },[events,employeeEvents]);

  const openDay=(date,evs)=>{ if(!evs.length) return; setSelectedDate(date); setSelectedEvents(evs); };
  const monthLabel=current.toLocaleString("default",{month:"long",year:"numeric"});
  const isToday=d=>{ const t=new Date(); return d.getFullYear()===t.getFullYear()&&d.getMonth()===t.getMonth()&&d.getDate()===t.getDate(); };

  return <>
    <div className="flex flex-col gap-4 w-full h-full">
      {(title||subtitle) && <div>{title && <h2 className="text-lg font-semibold text-neutral500">{title}</h2>}{subtitle && <p className="text-xs text-neutral300 mt-1">{subtitle}</p>}</div>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        {legend.length ? <div className="flex flex-wrap gap-2 text-[11px] text-neutral400">{legend.map(l=><div key={l.label} className="inline-flex items-center gap-2 rounded-full bg-bg50 px-3 py-1"><span className={`h-2.5 w-2.5 rounded ${l.dotClassName}`} /><span>{l.label}</span></div>)}</div> : null}
        <div className="flex items-center gap-2 text-xs">
          <button onClick={()=>setCurrent(new Date(current.getFullYear(),current.getMonth()-1,1))} className="h-8 w-8 flex items-center justify-center rounded-md border border-border bg-bg50"><HiOutlineChevronLeft className="h-4 w-4 text-neutral400" /></button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-white shadow-sm min-w-[180px] justify-center"><HiOutlineCalendar className="h-4 w-4 text-neutral300" /><span className="text-[11px] font-medium text-neutral500">{monthLabel}</span></div>
          <button onClick={()=>setCurrent(new Date(current.getFullYear(),current.getMonth()+1,1))} className="h-8 w-8 flex items-center justify-center rounded-md border border-border bg-bg50"><HiOutlineChevronRight className="h-4 w-4 text-neutral400" /></button>
        </div>
      </div>

      <div className="flex-1 rounded-[18px] border border-border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="bg-bg100 text-[11px] font-medium text-neutral400">{weekDays.map(d=><th key={d} className="h-10 text-center border-b border-border">{d}</th>)}</tr>
            </thead>
            <tbody className="text-[11px] sm:text-[12px]">
              {matrix.map((week,i)=><tr key={i} className="border-b border-border last:border-b-0">
                {week.map(({date,inCurrentMonth})=>{
                  const key=formatISO(date);
                  const dayEvents=combined[key]||[];
                  const todayFlag=isToday(date);
                  const isWeekend=date.getDay()===0||date.getDay()===6;
                  const baseBg = isWeekend && inCurrentMonth ? "bg-amber-100" : (inCurrentMonth?"bg-white":"bg-bg50");
                  const hasEvents=dayEvents.length>0;
                  const primaryEvent=dayEvents.find(ev=>ev.type==="present"||ev.type==="half-day"||ev.type==="holiday")||dayEvents[0]||null;
                  const pct=primaryEvent?.pct||0;
                  const totalMinutes=primaryEvent?.totalMinutes||0;
                  const isRunning=primaryEvent?.isRunning||false;
                  
                  return <td key={key} onClick={()=>hasEvents&&openDay(date,dayEvents)} className={`align-top border-r last:border-r-0 border-border px-2 sm:px-3 py-2 ${baseBg} ${hasEvents?"cursor-pointer hover:bg-bg50":""}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className={`h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center rounded-full text-xs ${todayFlag?"bg-selected text-white":"text-neutral400"}`}>{date.getDate()}</div>
                      {isWeekend && inCurrentMonth && <span className="text-[10px] text-neutral300">Weekend</span>}
                    </div>
                    <div className="min-h-[48px]">
                      {primaryEvent ? (
                        primaryEvent.type === "holiday" ? (
                          <div className="inline-flex items-start gap-2 flex-col">
                            <div className="rounded-md px-3 py-2 text-sm font-semibold bg-secondary100 w-full">
                              {primaryEvent.label || "Holiday"}
                            </div>
                          </div>
                        ) : todayFlag && isRunning ? (
                          <div className="relative w-full">
                            <div className="w-full h-8 rounded-md bg-[#c8e9e8] overflow-hidden flex items-center">
                              <div style={{width: `${pct}%`,height: "100%",background: "linear-gradient(90deg,#5ed4d2,#0ea5a4)"}}/>
                              <div className="absolute left-3 top-0 bottom-0 flex items-center text-sm font-semibold text-neutral900 pl-1">
                                {minsToHHMM(totalMinutes)}
                              </div>
                              <div className="absolute right-3 top-0 bottom-0 flex items-center text-[11px] text-neutral800 pr-1">
                                Working
                              </div>
                            </div>
                          </div>
                        ) : primaryEvent.type === "present" ? (
                          <div className="rounded-md px-3 py-2 text-sm font-semibold bg-teal-100 text-teal-700 w-full">
                            Present
                          </div>
                        ) : (
                          <div className="rounded-md px-3 py-2 text-sm font-semibold bg-orange-100 text-orange-700 w-full">
                            Half Day
                          </div>
                        )
                      ) : null}
                    </div>
                  </td>;
                })}
              </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <DayDetailPanel open={!!selectedDate} onClose={()=>{setSelectedDate(null);setSelectedEvents([])}} date={selectedDate} events={selectedEvents} loading={loading} />
  </>;
}
