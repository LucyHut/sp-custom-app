import * as React from "react";
import styles from "./RqcSite.module.scss";
import { AuthComponentProps } from "./IRqcSiteProps";

import RqcComponent  from "./rqcComponent";

export default class RqcSite extends React.Component<AuthComponentProps, {}> {
   render(): React.ReactElement<AuthComponentProps> {
    return (
      <div className={ styles.rqcSite }>
              <RqcComponent  {...this.props} />
             
      </div>
    );
  }
}