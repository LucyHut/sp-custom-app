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
 * Author: Lucie Hutchins, Senior DevOps Engineer
 * Department: IT
 * Company: The Jackson Laboratory
 * Date: 2023
 * 
 * ******************************************************************/
import RqcFormAccessDenied from "./rqcFormAccessDenied";

 import {
   getGraphEndpoint,
   getModelMetadata
 }from "./../local_lib/GraphService";

import styles from "./../RqcSite.module.scss";
const jax_email="lucie.hutchins@jax.org";
const form_notes={"1":["This Form is used to request the creation of a new GCP project or a new AWS organization. ",
 " Submission of this form will create a new ticket in service-now. The ticket will be assigned directely to RIT cloud team."],
 "2":["The standard request form is submitted to request resources provisioning or maintenance. These are our standard cloud offerings.", 
 "You must specify an existing GCP project name for Google Cloud Resources, or an existing AWS organization for AWS resources."],
 "3":["This form is used to submit Non-standard request types - These types of requests are more involved and require an expert analysis."," For example: planning for resources cost optimization, cloud solution evaluation, resources evaluation, nextflow pipeline support, and more."],
 "4":["Use this form to request on-demand training sessions.", "There are several initiatives that are being implemented to help our research community navigate the cloud and on-premise environments. One of these initiatives is the On-demand presentations/tutorials/demos.  Research IT provides on-demand brief presentations/tutorials/demos about cloud and on-premise resources to individual research lab meetings.  A typical presentation is about 45-50 minutes long followed with a 15–10-minute questions/discussion session. The presentation's topics are based on the host lab's needs and must be specified in the request detail field. Note: the date you specify when you submit this request is tentative."]
};

const FORM_ACTIONS={
   "1":"New GCP project/AWS organization",
   "2":"Standard Cloud Services",
   "3":"Ad-hoc Cloud Services",
   "4":"On-demand Training Session"
};
const NEW_REQUESTTYPE_OPTIONS={"gcp_project":"Create a New GCP Project","aws_org":"Create a New AWS Organization"};
const CLOUD_ENV={"dev":"Development","stage":"Staging","prod":"Production"};
const STANDARD_REQUEST_OPTIONS={
   "1":"Hosting Educational Workshops - (Virtual Machine, HPC Cluster, Kubernetes cluster)",
   "2":"Deploying workloads (HPC cluster, Kubernetes cluster, Batch, VMs, Cloud Life Sciences APIs, ...)",
   "3":"Private/Public facing resources (web, storage, applications)",
   "4":"Retire/Disable/Enable resources",  
   "5":"Grant/Remove access to resources and Identity",
   "6":"GCP Service account setup",
   "7":"Billing and Budgeting questions"
};
const NON_STANDARD_REQUEST_OPTIONS=[
   {"value":"1","label":"Getting started with Data Analytics (BigQuery)"},
   {"value":"2","label":"Getting started with Machine Learning"},
   {"value":"3","label":"VPC Network support"},
   {"value":"4","label":"Analysis Pipeline Workflow setup"},
   {"value":"5","label":"Others"}
];
const ON_DEMAND_REQUEST_OPTIONS=[
   {"value":"1","label":"On-demand Session on GCP"},
   {"value":"2","label":"On-demand Session on AWS"},
   {"value":"3","label":"Shiny App Deployment"},
   {"value":"4","label":"Getting Started with Containers"},
   {"value":"5","label":"How to run a workshop using  cloud resources (servers, storage)"},
   {"value":"6","label":"Getting started with on premise resources (HPC cluster, Storage, data transfer)"},
   {"value":"7","label":"Getting started with LIMS Applications (Clarity, Climb, Core PFS, ESP, iLAB)"},
   {"value":"8","label":"Others"}
];
const SnFormComponent = (props: any ) => {
     const [activeForm, setActiveForm]=React.useState("1");  
     const [sel_env, setSelEnv]= React.useState(null);
     const [employees, setEmployees]= React.useState(null);
     const [sel_emp, setSelEmployees]= React.useState(null);
     const [sel_reqtype, setSelReqType]= React.useState(null);
     const [sel_pi, setSelPi]= React.useState(null);
     const [digest, setDigest]= React.useState(null);
     const currentUser=props.submitterAcctUnits;
     /*
     Models are loaded into a data structure once
    then subsequent calls will use the dictionary.
    O(n)= n(times it takes to load) + AccessTime 
    This should be called once when the component mounts
    */
     React.useEffect(() => {
       loadEmp();
       getDigest();
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
   function handlePiChange(selected_options) {
      const option=new Object(selected_options);
      var value = null;
      if(option.hasOwnProperty("label")) {
             value= option["label"];
       }
       setSelPi(value);
      }

   function handleEnvChange(selected_options) {
         const option=new Object(selected_options);
         var value = null;
         if(option.hasOwnProperty("label")) {
                value= option["label"];
          }
          setSelEnv(value);
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
  //load the employee selection - 
  // exclude current user
// exclude active requestors
function getEmpOptions(data:any, requester_email:string){
   let options=[];
   let email_exists= [];
   if(data){
    for(var index in data){
      const item=data[index];
      const email= item["emp_email"];
      const name= item["emp_name"];
      const emp_id= item["emp_id"]+":"+item["user_name"];
      const emp=item["emp_id"];
      const label= name+" :EMAIL# "+email;
      if(email_exists.indexOf(email)<=-1){
               options.push({"value": emp_id, "label":label});
               email_exists.push(email);
      }
   }}
   return options;
}

function getOptions(items:any){
   let options=[];
   for (var key in items){
      let label=items[key];
      options.push({"value":key, "label":label});
   }
   return options;
}
 function getOnDemandRequesterForm(){
   return (
      <Form name="new_perm">
      
      <FormGroup className={styles.input_block}>
        <Row>
          <Col sm="5"><Label for="act_emp">
              <h4>*Requested For</h4>
              <em>Note: Who is this request for? (you or another individual)</em>
             </Label></Col>
          <Col><Select name="act_emp" id="act_emp"
             onChange={(event) => handleEmpChange(event)}
             options={getEmpOptions(employees,jax_email)}/>
          </Col>
        </Row>
      </FormGroup>
      <FormGroup  className={styles.input_block}>
        <Row>
          <Col sm="5"><Label for="pi"><h4>*PI Name</h4></Label></Col>
          <Col><Select name="pi" id="pi"
             options={getEmpOptions(employees,jax_email)}/>
          </Col>
       </Row>
      </FormGroup>
      <FormGroup  className={styles.input_block}>
        <Row>
          <Col sm="5"><h4><Label for="request_type">*Request Type</Label></h4></Col>
          <Col>
            <Select name="request_type" id="request_type" 
               options={ON_DEMAND_REQUEST_OPTIONS}/>
          </Col>
         </Row>
      </FormGroup>
      <FormGroup  className={styles.input_block}>
        <Row>
          <Col sm="5"><Label for="details"><h4>*Request Detail</h4>
          <em>Note: a brief summary of your needs</em>
          </Label></Col>
          <Col>
             <Input type="textarea" name="details" id="details" />
          </Col>
       </Row>
      </FormGroup>
      <FormGroup  className={styles.input_block}>
        <Row>
          <Col sm="5"><Label for="event"><h4>*Event Date</h4>
          <em>Note: Tentative date - must be at least 10 working days before the event</em>
          </Label></Col>
          <Col>
             <Input type="textarea" name="event" id="event" />
          </Col>
       </Row>
      </FormGroup>
    </Form>
   );

 }
 function getNStandardRequesterForm(){
   return (
      <Form name="new_perm">
      
      <FormGroup className={styles.input_block}>
        <Row>
          <Col sm="5"><Label for="act_emp">
              <h4>*Requested For</h4>
              <em>Note: Who is this request for? (you or another individual)</em>
             </Label></Col>
          <Col><Select name="act_emp" id="act_emp"
             onChange={(event) => handleEmpChange(event)}
             options={getEmpOptions(employees,jax_email)}/>
          </Col>
        </Row>
      </FormGroup>
      <FormGroup  className={styles.input_block}>
        <Row>
          <Col sm="5"><Label for="pi"><h4>*PI Name</h4></Label></Col>
          <Col><Select name="pi" id="pi"
             options={getEmpOptions(employees,jax_email)}/>
          </Col>
       </Row>
      </FormGroup>
      <FormGroup  className={styles.input_block}>
        <Row>
          <Col sm="5"><h4><Label for="request_title">*Request Title</Label></h4></Col>
          <Col>
             <Input type="textarea" name="request_title" id="request_title" />
          </Col>
         </Row>
      </FormGroup>
      <FormGroup  className={styles.input_block}>
        <Row>
          <Col sm="5"><Label for="details"><h4>*Request Detail</h4>
          <em>Note: a brief summary of your needs</em>
          </Label></Col>
          <Col>
             <Input type="textarea" name="details" id="details" />
          </Col>
       </Row>
      </FormGroup>
      
    </Form>
   );
}
function getStandardRequesterForm(){
   return (
      <Form name="new_perm">
      
      <FormGroup className={styles.input_block}>
        <Row>
          <Col sm="5"><Label for="act_emp">
              <h4>*Requested For</h4>
              <em>Note: Who is this request for? (you or another individual)</em>
             </Label></Col>
          <Col><Select name="act_emp" id="act_emp"
             onChange={(event) => handleEmpChange(event)}
             options={getEmpOptions(employees,jax_email)}/>
          </Col>
        </Row>
      </FormGroup>
      <FormGroup  className={styles.input_block}>
        <Row>
          <Col sm="5"><Label for="pi"><h4>*PI Name</h4></Label></Col>
          <Col><Select name="pi" id="pi"
             options={getEmpOptions(employees,jax_email)}/>
          </Col>
       </Row>
      </FormGroup>
      <FormGroup  className={styles.input_block}>
        <Row>
          <Col sm="5"><h4><Label for="request_type">*Request Type</Label></h4></Col>
          <Col>
            <Select name="request_type" id="request_type" 
               onChange={(event) => handleTypeChange(event)}
               options={getOptions(STANDARD_REQUEST_OPTIONS)}/>
          </Col>
         </Row>
      </FormGroup>
      <FormGroup  className={styles.input_block}>
        <Row>
          <Col sm="5"><Label for="project_name"><h4>*GCP Project Name</h4>
          <em>Note: Reference GCP project or AWS organization</em>
          </Label></Col>
          <Col>
             <Input type="textarea" name="project_name" id="project_name" />
          </Col>
       </Row>
      </FormGroup>
      <FormGroup  className={styles.input_block}>
        <Row>
          <Col sm="5"><Label for="details"><h4>*Request Detail</h4>
          <em>Note: a brief summary of your request</em>
          </Label></Col>
          <Col>
             <Input type="textarea" name="details" id="details" />
          </Col>
       </Row>
      </FormGroup>
      
    </Form>
   );
}
function getNewRequesterForm() {
      return (
          <Form name="new_perm">
      
            <FormGroup className={styles.input_block}>
              <Row>
                <Col sm="5"><Label for="act_emp">
                    <h4>*Requested For</h4>
                    <em>Note: Who is this request for? (you or another individual)</em>
                   </Label></Col>
                <Col><Select name="act_emp" id="act_emp"
                   onChange={(event) => handleEmpChange(event)}
                   options={getEmpOptions(employees,jax_email)}/>
                </Col>
              </Row>
            </FormGroup>
            <FormGroup  className={styles.input_block}>
              <Row>
                <Col sm="5"><Label for="pi"><h4>*PI Name</h4></Label></Col>
                <Col><Select name="pi" id="pi"
                   options={getEmpOptions(employees,jax_email)}/>
                </Col>
             </Row>
            </FormGroup>
            <FormGroup  className={styles.input_block}>
              <Row>
                <Col sm="5"><h4><Label for="request_type">*Request Type</Label></h4></Col>
                <Col>
                  <Select name="request_type" id="request_type" 
                     options={getOptions(NEW_REQUESTTYPE_OPTIONS)}/>
                </Col>
               </Row>
            </FormGroup>
            <FormGroup  className={styles.input_block}>
              <Row>
                <Col sm="5"><Label for="project_name"><h4>*Research Project Name</h4>
                <em>Note: we use this information to label some of the resources</em>
                </Label></Col>
                <Col>
                   <Input type="textarea" name="project_name" id="project_name" />
                </Col>
             </Row>
            </FormGroup>
            <FormGroup  className={styles.input_block}>
              <Row>
                <Col sm="5"><Label for="billing"><h4>*Billing – Accounting Unit/ Activity Number</h4>
                <em>Note: we use this information for your cloud resources usage billing</em>
                </Label></Col>
                <Col>
                   <Input type="textarea" name="billing" id="billing" />
                </Col>
             </Row>
            </FormGroup>
            <FormGroup className={styles.input_block}>
             <Row>
                <Col sm="5"><Label for="c_env"><h4>*Environment</h4></Label></Col>
                <Col><Select name="c_env" id="c_env"
                    options={getOptions(CLOUD_ENV)}
                  />
               </Col>
             </Row>
            </FormGroup>
            <FormGroup  className={styles.input_block}>
              <Row>
                <Col sm="5"><Label for="access"><h4>*User Access</h4>
                <div><b>Note:</b> Enter user-role or  commas separated list of user-role if multiple users. 
                <b>Format:</b> user1 – basic role, … usern – basic role;  where basic role is one of the following: <b>Editor, Viewer, or Billing Admin</b></div>
                </Label></Col>
                <Col>
                   <Input type="textarea" name="access" id="access" />
                </Col>
             </Row>
            </FormGroup>
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
           case "2":
            form_container.push(
               <blockquote className={styles.rqc_form}  key={`table-${form_id}`}>
                  <h2>{label}</h2>
                  <blockquote className={styles.overview_section}>
                        <div>{form_notes[form_id]}</div>
                  </blockquote>
                  {getStandardRequesterForm()}
               </blockquote>
             );
             break;
            case "3":
               form_container.push(
                  <blockquote className={styles.rqc_form}  key={`table-${form_id}`}>
                     <h2>{label}</h2>
                     <blockquote className={styles.overview_section}>
                           <div>{form_notes[form_id]}</div>
                     </blockquote>
                     {getNStandardRequesterForm()}
                  </blockquote>
                );
                break;
            case "4":
                 form_container.push(
                     <blockquote className={styles.rqc_form}  key={`table-${form_id}`}>
                        <h2>{label}</h2>
                        <blockquote className={styles.overview_section}>
                              <div>{form_notes[form_id]}</div>
                        </blockquote>
                        {getOnDemandRequesterForm()}
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

   return(
      <div>
          <div className={styles.section_header} ><h2>RIT Cloud Services Request Forms</h2></div>
          <Nav className={styles.page_section_nav} tabs>
            {
            $.map(FORM_ACTIONS,(form_label:string,form_key:string)=>{
               return(
                  <NavItem> 
                  <NavLink
                     className={classnames({ active: activeForm === `${form_key}` })}
                     onClick={() => { toggleTab(`${form_key}`); }}
                     style={{cursor:"pointer"}}
                     >
                    {form_label}
                  </NavLink>
                  </NavItem>
            );
           })
         }
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
export default SnFormComponent;                            
