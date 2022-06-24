import* as React from "react";
import { Form } from "reactstrap";
import { FormGroup, Label, Input, TabContent, TabPane, Nav, NavItem, NavLink, Row, Col } from "reactstrap";
import classnames from "classnames";
import $ from "jquery";
import Select from "react-select";
import axios from "axios";

import { MSGraphClient } from "@microsoft/sp-http";
import { IDigestCache, DigestCache } from '@microsoft/sp-http';

/********************************************************************
 * 
 * This component is a HOC (High Order Component) to render different
 *  forms based on user's selection.
 * 
 * Author: Lucie Hutchins, DevOps Engineer
 * Department: IT
 * Company: The Jackson Laboratory
 * Date: 2020
 * 
 * ******************************************************************/
import RqcFormAccessDenied from "./rqcFormAccessDenied";
import {
   REQUESTTYPE_OPTIONS,
   FORM_ACTIONS
} from "./../local_lib/constants";

 import {
   getGraphEndpoint,
   getModelMetadata,
   getSubmittermail,
   capitalizeFirstCharacter
 }from "./../local_lib/GraphService";

import styles from "./../RqcSite.module.scss";
import FormModal from "./formModal";

const form_notes={"1":["The RQC Requestor Request Form is used to request permissions for an employee to submit internal and/or external requisitions in Lawson.",
 " Submission of this form will trigger the RQC Requestor setup process flow in Service-now."],
 "2":["Requestor Permissions Removal form is not ready for usage yet. ", 
 "In the meantime, please contact purchasing@jax.org to submit Permissions removal requests."]
};

const RqcFormComponent = (props: any ) => {
     const [activeForm, setActiveForm]=React.useState("1");  
     const [au_activities, setAuActivities]= React.useState(null);
     const [employees, setEmployees]= React.useState(null);
     const [locations, setLocations]= React.useState(null);
     const [requestors, setRequestors]= React.useState(null);
     const currentUser=props.submitterAcctUnits;
     const [sel_employees, setSelEmployees]= React.useState(null);
     const [sel_reqtype, setSelReqType]= React.useState(null);
     const [sel_locations, setSelLocations]= React.useState(null);
     const [sel_au, setSelAu]= React.useState(null);
     const [sel_au_activities, setSelAuActivities]= React.useState(null);
     const [digest, setDigest]= React.useState(null);
     /*
     Models are loaded into a data structure once
    then subsequent calls will use the dictionary.
    O(n)= n(times it takes to load) + AccessTime 
    This should be called once when the component mounts
    */
     React.useEffect(() => {
       loadEmp();
       getDigest();
       loadActivities();
       loadLocations();
       loadRequerors();
    }, []);

   const toggleTab = (tab: string)=> {
      if(activeForm !== tab) setActiveForm(tab);
   };

  // This function is to cache SharePoint security token used in
  // Representational state transfer (REST) API calls
   async function getDigest(){
      const digestCache: IDigestCache = props.context.serviceScope.consume(DigestCache.serviceKey);
      await digestCache.fetchDigest(props.context.pageContext.web.serverRelativeUrl).then(
         (ndigest: string)=>setDigest(ndigest));
   }
   // Accounting Units utils 
   function getAcctUnitsOptions(){
      let options=[];
      for(var acct_id in currentUser["aus"]){
             const label="AU# "+acct_id;
             options.push(
                {"value": acct_id, "label":label}
             );
      }
      return options;
  } 
  function handleAuChange(selected_options) {
      var value = [];
      for (var i = 0, l = selected_options.length; i < l; i++) {
             value.push(selected_options[i].label);
       }
      setSelAu(value);
  }
  function handleActChange(selected_options) {
      var value = [];
      for (var i = 0, l = selected_options.length; i < l; i++) {
          value.push(selected_options[i].label);
       }
       setSelAuActivities(value);
  }

 function handleEmpChange(selected_options) {
     const option=new Object(selected_options);
     var value = {};
     if(option.hasOwnProperty("label")) {
          const [name, email]= option["label"].split(":");
          const [emp_id,user_name]=option["value"].split(":");
          value["name"]=name;
          value["email"]=email;
          value["emp_id"]=emp_id;
          value["user_name"]=user_name;
      }
      setSelEmployees(value);
   }
   function handleTypeChange(selected_options) {
      const option=new Object(selected_options);
      var value = null;
      if(option.hasOwnProperty("label")) {
             value= option["label"];
       }
       setSelReqType(value);
      }
      function handleLocChange(selected_options) {
         const option=new Object(selected_options);
         var value = null;
         if(option.hasOwnProperty("label")) {
                value= option["label"];
          }
          setSelLocations(value);
         }
  /// Activities
  function getActivityOptions(target_acct_units){
   let options=[];
   const activities= new Array(au_activities);
   for(var index in au_activities){
      const activity=au_activities[index];
      const au= activity["acct_unit"];
      const act_id= activity.activity;
      const label=act_id+" - "+activity.short_desc+"(AU# "+au+")";
      if(target_acct_units){
        for(var acct_unit in target_acct_units){
           if(au === acct_unit){
             options.push({"value": act_id, "label":label});
          }
        }
      }
   }
   return options;
  }
  function loadActivities(){
   props.msGraphClientFactory
    .getClient()
    .then((client: MSGraphClient) => {
      client
        .api(getGraphEndpoint("au2activity"))
        .version("v1.0")
        .get((err, res)=>{
            if(err){
              console.error(err);
              return;
            }
          let model=getModelMetadata(res.value,"au2activity.json");
           axios.get(model["@microsoft.graph.downloadUrl"])
           .then((result)=>{
              setAuActivities(result.data);
           });
          });
        });
    }
   /// Active requestors
   function loadRequerors(){
      props.msGraphClientFactory
      .getClient()
      .then((client: MSGraphClient) => {
        client
          .api(getGraphEndpoint("req2au"))
          .version("v1.0")
          .get((err, res)=>{
              if(err){
                console.error(err);
                return;
              }
             let model=getModelMetadata(res.value,"req2au.json");
             axios.get(model["@microsoft.graph.downloadUrl"])
             .then((result)=>{
                setRequestors(result.data);
             });
            });
       });
     }
  ////// Employee
  function loadEmp(){
   props.msGraphClientFactory
   .getClient()
   .then((client: MSGraphClient) => {
     client
       .api(getGraphEndpoint("active_emp"))
       .version("v1.0")
       .get((err, res)=>{
           if(err){
             console.error(err);
             return;
           }
          let model=getModelMetadata(res.value,"active_emp.json");
          axios.get(model["@microsoft.graph.downloadUrl"])
          .then((result)=>{
             setEmployees(result.data);
          });
         });
    });
  }
  //store active requestors in a dictionary
  // using requestor number as the key
  function  activeRequestors(data:any){
     let requesters_map=[];
     if(data){
        for(var index in data){
           const item=data[index];
           const email= item["email_address"];
           if(requesters_map.indexOf(email)<=-1){
              requesters_map.push(email.toLowerCase());
           }
         }
     }
     return requesters_map;
  }
  //load the employee selection - 
  // exclude current user
// exclude active requestors
function getEmpOptions(data:any, requester_email:string){
   let options=[];
   let email_exists= [];
   const active_requestors=activeRequestors(requestors);
   if(data){
    for(var index in data){
      const item=data[index];
      const email= item["emp_email"];
      const name= item["emp_name"];
      const emp_id= item["emp_id"]+":"+item["user_name"];
      const emp=item["emp_id"];
      const label= name+" :EMAIL# "+email;
      if(email.toLowerCase() !== requester_email.toLowerCase()){
         if(active_requestors.indexOf(email.toLowerCase())<=-1){
            if(email_exists.indexOf(email)<=-1){
               options.push({"value": emp_id, "label":label});
               email_exists.push(email);
            }}
      }
   }}
   return options;
}
  //////// Locations
function loadLocations(){
   props.msGraphClientFactory
   .getClient()
   .then((client: MSGraphClient) => {
     client
       .api(getGraphEndpoint("req_loc"))
       .version("v1.0")
       .get((err, res)=>{
           if(err){
             console.error(err);
             return;
           }
         let model=getModelMetadata(res.value,"req_loc.json");
          axios.get(model["@microsoft.graph.downloadUrl"])
          .then((result)=>{
             setLocations(result.data);
          });
         });
   });
 }
 function getLocationOptions(data){
   let options=[];
   
   for(var index in data){
      const location=data[index];
      const loc_addr= location.address;
      const loc_id= location.req_location;
      const loc_name= location.r_name;
      const label=loc_id+" - "+loc_name+"(Addr: "+loc_addr+")";
      options.push({"value": loc_id, "label":label});
   }
   return options;
}
 
 
 function getSubmitterName(){
   const jax_email=getSubmittermail(props.user_email); //"Suzanne.Prince@jax.org"; // "jaxqa@service-now.com,"+user_jax_email;
   if(jax_email){
      const [usr_name,domaine_name] =jax_email.split("@");
      const [first_name, last_name]= usr_name.split(".");
      const subm_name=capitalizeFirstCharacter(first_name)+" "+capitalizeFirstCharacter(last_name);
      return subm_name;
   }else{return ""; }
 }
function getNewRequesterForm() {
      const jax_email=getSubmittermail(props.user_email);
      const subm_name=getSubmitterName();
      const emp_name=(sel_employees)?sel_employees["name"]:null;
      const emp_email=(sel_employees)?sel_employees["email"]:null;
      let emp_numb=(sel_employees)?sel_employees["emp_id"]:null;
      let user_name=(sel_employees)?sel_employees["user_name"]:null;
      const comment = $('#comment').val();
      const modal_title="RQC Access Request for "+emp_name+" - Requested by "+subm_name;
      const formData= {
         "Requested By": {isRequired:true,data:subm_name},
         "Requestor name":  {isRequired:true,data:emp_name},
         "Requestor email":  {isRequired:true,data:emp_email},
         "Requestor number": {isRequired:true,data:emp_numb},
         "Requestor username":  {isRequired:true,data:user_name},
         "Request Type":  {isRequired:true,data:sel_reqtype},
         "Requestor Location":  {isRequired:true,data:sel_locations},
         "Assigned Accounting Units": {isRequired:true,data:sel_au},
         "Assigned Activities": {isRequired:false,data:sel_au_activities},
         "Additional Comment": {isRequired:false,data:comment}
      };
      return (
          <Form name="new_perm">
              <FormGroup  className={styles.input_block}>
                <Row>
                  <Col sm="5"><h4>Requested By:</h4></Col>
                  <Col><Label for="requested_by_name"><h4>{subm_name}</h4></Label>
                     <Input type="hidden" name="requested_by_name" id="requested_by_name" value={subm_name} />
                     <Input type="hidden" name="requested_by_email" id="requested_by_email" value={props.user_email} />
                  </Col>
                </Row>
            </FormGroup>
            <FormGroup className={styles.input_block}>
              <Row>
                <Col sm="5"><Label for="act_emp">
                    <h4>RQC Requestor*</h4>
                    <em>Note: The Select list excludes all Active Requestors and the current user</em>
                   </Label></Col>
                <Col><Select name="act_emp" id="act_emp"
                   onChange={(event) => handleEmpChange(event)}
                   options={getEmpOptions(employees,jax_email)}/>
                </Col>
              </Row>
            </FormGroup>
            <FormGroup  className={styles.input_block}>
              <Row>
                <Col sm="5"><Label for="comment"><h4>Comment:</h4></Label></Col>
                <Col>
                   <Input type="textarea" name="comment" id="comment" />
                </Col>
             </Row>
            </FormGroup>
            <FormGroup  className={styles.input_block}>
              <Row>
                <Col sm="5"><h4><Label for="request_type">Request Type*</Label></h4></Col>
                <Col>
                  <Select name="request_type" id="request_type" 
                     onChange={(event) => handleTypeChange(event)}
                     options={REQUESTTYPE_OPTIONS}/>
                </Col>
               </Row>
            </FormGroup>
            <FormGroup className={styles.input_block}>
             <Row>
                <Col sm="5"><Label for="d_location"><h4>Default Requestor Location*</h4></Label></Col>
                <Col><Select name="d_location" id="d_location"
                    onChange={(event) => handleLocChange(event)}
                    options={getLocationOptions(locations)}
                  />
               </Col>
             </Row>
            </FormGroup>
            <FormGroup className={styles.input_block}>
               <Row>
                <Col sm="5"><Label for="acct_unit"><h4>Accounting Units*</h4></Label></Col>
                  <Col><Select name="acct_unit" id="acct_unit"
                    isMulti
                    onChange={(event) => handleAuChange(event)}
                    options={getAcctUnitsOptions()}/>
                </Col>
             </Row>
            </FormGroup>
            <FormGroup className={styles.input_block}>
              <Row>
                <Col sm="5"><Label for="au_activity"><h4>Activity List</h4></Label></Col>
                <Col><Select name="au_activity" id="au_activity"
                   isMulti
                   onChange={(event)=>handleActChange(event)}
                   options={getActivityOptions(currentUser["aus"])}
                   />
              </Col>
             </Row>
           </FormGroup>
            <FormModal 
                buttonLabel="Next" 
                className="bg_red"
                formData={formData}
                p_title={modal_title}
                user_jax_email={jax_email}
             />
            
          </Form>
       );
    }
    function getFormData(form_id:string , label:string) {
       const form_container=[];
       switch(form_id){
          case "1":
             form_container.push(
               <blockquote className={styles.rqc_form}  key={`table-${form_id}`}>
                  <h2>{label}</h2>
                  <blockquote className={styles.overview_section}>
                        <div>{form_notes[form_id]}</div>
                  </blockquote>
                  {getNewRequesterForm()}
               </blockquote>
             );
             break;
          default:
             form_container.push(
               <blockquote className={styles.rqc_form}  key={`table-${form_id}`}>
                  <h2>{label}</h2>
                  <blockquote className={styles.overview_section}>
                        <div>{form_notes[form_id]}</div>
                  </blockquote>
            </blockquote>
             );
       }
       return form_container;
   }
   const submitter_name=getSubmitterName();
   //Check if curent user has permission to form access
   const isAllowed=(currentUser.hasOwnProperty("aus"))?true:false;
    if(!isAllowed){
      return(
         <RqcFormAccessDenied 
         user_name={submitter_name} 
         user_email={props.user_email} 
         />
      );
   }
   return(
      <div>
          <div className={styles.section_header} ><h2>RQC Access Request Forms</h2></div>
          <Nav className={styles.page_section_nav} tabs>
              <NavItem> 
              <NavLink
                 className={classnames({ active: activeForm === "1" })}
                 onClick={() => { toggleTab("1"); }}
                 style={{cursor:"pointer"}}
                >
                NEW
             </NavLink>
            </NavItem>
           <NavItem>
              <NavLink
                 className={classnames({ active: activeForm === "2" })}
                 onClick={() => { toggleTab("2"); }}
                 style={{cursor:"pointer"}}
                >
                REMOVE
             </NavLink>
           </NavItem>
        </Nav>
        <blockquote>
        <TabContent activeTab={activeForm}>
           { $.map(FORM_ACTIONS,(form_label, form_key)=>{
              return(
                 <TabPane tabId={form_key} key={form_key} style={{padding:"0",margin:"0"}}>
                    {getFormData(form_key, form_label)}
                    <div id="form-messages"></div>
                 </TabPane>
               );
             })
            }
        </TabContent>
        </blockquote>   
      </div>
   );
};
export default RqcFormComponent;                            
