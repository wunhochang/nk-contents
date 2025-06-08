import React from "react";
import ReactDOM from "react-dom";
const loadScript = require('load-script');

var defaultScriptUrl = "/assets/js/ckeditor/ckeditor.js";

/**
 * @author codeslayer1
 * @description CKEditor component to render a CKEditor textarea with defined configs and onChange callback handler
 */
class CKEditor extends React.Component {
  constructor(props) {
    super(props);

    //Bindings
    this.onLoad = this.onLoad.bind(this);

    //State initialization
    this.state = {
      isScriptLoaded: this.props.isScriptLoaded,
      content: this.props.content,
      config: this.props.config
    };
  }

  //load ckeditor script as soon as component mounts if not already loaded
  componentDidMount() {
    if(!this.props.isScriptLoaded){
      loadScript(this.props.scriptUrl, this.onLoad);
    }
  }
   onLoad(){
    this.setState({
      isScriptLoaded: true
    });

    if (!window.CKEDITOR) {
      console.error("CKEditor not found");
      return;
    }

    this.editorInstance = window.CKEDITOR.appendTo(
      ReactDOM.findDOMNode(this),
      this.state.config,
      this.state.content,
    );

    this.editorInstance.on("change", () => {
      this.setState({
        content: this.editorInstance.getData()
      });

      //call callback if present
      if(this.props.onChange){
        this.props.onChange(this.state.content);
      }
    });

    this.editorInstance.on("instanceLoaded", (e) => {
      e.editor.resize('100%', '100%');
    });

    this.editorInstance.on("contentDom", (e) => {
      //console.log('contentDom')
      //console.log(e);
      //console.log(this);
      e.editor.resize('100%', '100%');
    });

  }

  render() {
    return <div className={this.props.activeClass} />;
  }
}

CKEditor.defaultProps = {
  content: "",
  config: {
    baseFloatZIndex:100001,
    height :'100%',
    width :'100%',
    removeDialogTabs:'image:advanced;link:advanced',
    format_tags:'p;h1;h2;h3;pre',
    imageInfo:{
      width:'450',
      height:'250',
      isLocked:true
    }
    //extraPlugins : 'ckeditortablecellsselection,tableresize,imageuploader' 금호쪽 참조
  },
  isScriptLoaded: false,
  scriptUrl: defaultScriptUrl,
  activeClass: ""
};

CKEditor.propTypes = {
  content: React.PropTypes.any,
  config: React.PropTypes.object,
  onChange: React.PropTypes.func,
  isScriptLoaded: React.PropTypes.bool,
  scriptUrl: React.PropTypes.string,
  activeClass: React.PropTypes.string
};

export default CKEditor;
