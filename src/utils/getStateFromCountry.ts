import { State } from "country-state-city"

export const getStateNameFromCode = (stateCode:string)=>{
    return State.getStateByCode(stateCode)?.name || '-' as string
}