import * as React from "react";
import { Row, Col,FormGroup, Label } from "reactstrap";
import Select from "react-select";
import axios from "axios";
import { MSGraphClient } from "@microsoft/sp-http";

import {
  getGraphEndpoint
}from "./../local_lib/GraphService";


import styles from "./../RqcSite.module.scss";
/*  
 this component handles the "Default Requestor Location" field.
 Including the api call to fetch the associated data
 and data rendering of the list
*/  
const RqcLocationComponent = (props) => {
  const [locations, setLocations]= React.useState(null);
  React.useEffect(() => {
     loadLocations();
  }, []);

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
             axios.get(res["@microsoft.graph.downloadUrl"])
             .then((result)=>{
                //console.log(result);
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
  return (
     <FormGroup className={styles.input_block}>
        <Row>
          <Col sm="5"><Label for="d_location"><h4>Default Requestor Location*</h4></Label></Col>
          <Col><Select name="d_location" id="d_location"
              options={getLocationOptions(locations)}
             />
         </Col>
       </Row>
      </FormGroup>
  );
};
export default RqcLocationComponent;                                
