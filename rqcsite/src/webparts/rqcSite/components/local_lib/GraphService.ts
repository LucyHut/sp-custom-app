
import {
  END_POINTS,
  TENANT
} from "./constants";

//intiating typescript dictionaries
var appEndPoints: {[key: string]:string} = END_POINTS;
var appTenant:{[key: string]: Object}= TENANT;
/***************************************************
 * 
 * Global Scope Functions definition
 * 
 * Author: Lucie Hutchins, DevOps Engineer
 * Department: IT
 * Company: The Jackson Laboratory
 * Date: 2020
 * 
 * *  SharePoint tenants
   * 
   * Models are relative to the Documents library on a given tenant site
   * Production is done on the Financial Services Site of jacksonlaboratory.sharepoint.com tenant
   * Test is done on the jaxspdev site of jaxspdev.sharepoint.com
   * 
 ****************************************************/

export function capitalizeFirstCharacter(token:string){
   if(token){
      return token.charAt(0).toUpperCase() + token.slice(1);
   }else{ return token; }
 }

export  function getGraphEndpoint(form_id: string){
  const file_name=appEndPoints[form_id];
  const tenant_name=window.location.hostname;
  const host_id= appTenant[tenant_name]["site_id"];
  const site_drive_path=appTenant[tenant_name]["site_models_dir"];
  const tenant_site_api_entry_url='/sites/'+host_id+site_drive_path+'/children?name="'+file_name+'"';
   //const tenant_api_entry_url="/sites/"+api_config.DEV_SP_HOST_NAME+drive_path+"/"+file_name;
  return tenant_site_api_entry_url;
}
export function getModelMetadata(model_list:Array<Object>, model:string){
  for(var index=0; index<model_list.length; ++index){
       if(model_list[index].hasOwnProperty("name")){
          if(model_list[index]["name"]===model){
            return model_list[index];
          }
       }
  }
}
export function getSubmittermail(user_email:string){
  if(user_email){
     const[prefix,suffix] = user_email.split("@");
     const user_jax_email=(prefix!=="hutchl")?prefix+"@jax.org":"lucie.hutchins@jax.org";
     return user_jax_email;
  }else{return ""; }
}