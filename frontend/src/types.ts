export type User = { id:number; name:string; email:string; target_role:string }
export type Skill = { id:number; name:string; level:number; category:string }
export type Job = { id:number; title:string; description:string }
export type Gap = { skill:string; current_level:number; required_level:number; gap:number; importance:string }
export type Requirement = { skill_name:string; importance:string; required_level:number }
export type Analysis = { job_id:number; role:string; match:number; matched_skills:string[]; gaps:Gap[]; requirements:Requirement[] }
export type Task = { id:number; job_id:number; title:string; description:string; status:string; order_number:number }
