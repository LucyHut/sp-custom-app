import* as React from 'react';
import { 
    Row,
    Col,
    Table,  
    Button, 
    Modal, 
    ModalHeader, 
    ModalBody, 
    ModalFooter 
    } from 'reactstrap';

import $ from "jquery";

/**************************************************************************
FromModal component

Previews the current form selections into a tabular view with
the option to go back to the form if one of the required fields is missing.
Or to cancel the form submission. Otherwise submit the form. 

This component has two functions:
1) getFormData : generates a tabular view of the form selection
2) sendMail: formats form selection fields and sends email to service-now

Note: Before deploying this to PROD, make sure service-now email is updated
to production 

 * Author: Lucie Hutchins, DevOps Engineer
 * Department: IT
 * Company: The Jackson Laboratory
 * Date: 2020

******************************************************************************/
const FormModal=(props: any)=>{
    const {
        buttonLabel,
        className,
        formData,
        p_title,
        user_jax_email
      } = props;

    const [modal, setModal] = React.useState(false);
    let hasMissingField=false;
    //service-now
    //We need to update this from jaxqa to production address
    //jax@service-now.com   -- production environment
    //jaxqa@service-now.com -- test environment
    const sn_email="jax@service-now.com"; 

    const toggle = () => setModal(!modal);

    function sendMail() {
      const  fmessage=$.map(formData, (fieldData,fieldLabel)=> fieldLabel+":  "+fieldData.data);
      const url= 'mailto:'+sn_email+'?cc='+user_jax_email+'&subject='+p_title+ '&body=' + fmessage.join(" || ");
      toggle();
      window.location.href = url;
    }
    
    function getFormData(){
        const formFields=$.map(formData, (fieldData,fieldLabel)=>{
            const field_data=(fieldData.data===null)?"ERROR: required field missing value":fieldData.data;
            if(fieldData.isRequired && fieldData.data===null){
               hasMissingField=true;
               return(<tr style={{color:"#ff0000",fontWeight:"bold"}}><th>{fieldLabel}</th><td>{field_data}</td></tr>);    
            }
            else{
              return(<tr><th>{fieldLabel}</th><td>{fieldData.data}</td></tr>);    
            }
            
        });
        return(
            <Table striped>
                 <thead>
                    <tr>
                      <th></th><th></th>
                    </tr>
                 </thead>
                 <tbody>
                  {formFields}
               </tbody>
            </Table>
         );
    }
    return(
        <div>
          <Row>
             <Col sm="3"><Button color="danger" onClick={toggle}>{buttonLabel}</Button></Col>
             <Col sm="3"><Button color="secondary" disabled>Reset</Button></Col>
          </Row>
         <Modal isOpen={modal} toggle={toggle} className={className}>
           <ModalHeader toggle={toggle}>{p_title}</ModalHeader>
           <ModalBody>{getFormData()}</ModalBody>
           <ModalFooter>
           { hasMissingField &&(
              <>
                <Button color="secondary" disabled >Submit</Button>
                <Button color="primary" onClick={toggle}>Back</Button>
              </>
           )}
           { !hasMissingField &&(
             <>
                <Button color="danger" onClick={toggle}>Cancel</Button>
                <Button color="primary" onClick={sendMail}>Submit</Button>
              </>
           )}
           </ModalFooter>
         </Modal>
     </div>
   );

};

 export default FormModal;