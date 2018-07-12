import React, { Component} from 'react';
import { createStructuredSelector } from 'reselect';
import { compose} from 'redux';
import { connect} from 'react-redux';
import injectReducer from 'utils/injectReducer';
import reducer from './reducer';

//Basically this is for displaying paths that have unique filter. one-to-one relationship of filter and content.import React, { Component} from 'react';
import {

    concentrationSelected,
    loadedContent,
    concentrationsLoaded,

} from './actions';

import {
    makeSelectFirebase
} from 'containers/App/selectors';

import {

    makeSelectConcentration,
    makeSelectConcentrations,
    makeSelectContent,
} from './selectors';

import {
    FilterWrapper,
    FilterItems,
    FilterItem,
    ResultWrapper,
} from 'components/StyledComponents/PathsPage';

import { 
    SelectPrompt,
} from 'components/StyledComponents/UniquePathsPage';


class PathsUnique extends Component{


    constructor(props){

        super(props);

        this.unsubscribe = null;
        this.setUpListener = this.setUpListener.bind(this);

    }

    componentDidMount(){

        //Initial state of filter, will be first one by default, or I could render nothing and instead of treat like filter
        //treat like button to load stuff different,(still like filter lmao).
        //Might not need this here, will have in update. What I want here is for this to pull all of the concentrations.
        //in other words keys of all documents, but for time sake, though prob same amount lol, will just have field.



        const needToKnowRef = this.props.firebase.firestore().collection("Library").doc("Paths").collection("NeedToKnows");

        needToKnowRef.doc("metaData").get()
            .then(docSnapshot => {

                if (docSnapshot.exists){
                    const concentrations = docSnapshot.get("concentrations");
                    this.props.onConcentrationsLoaded(concentrations);
                }

            })



    }

    //Not using state, but not sure if will auto state if only do one.
    componentDidUpdate(prevProps, prevState){

        //If not the same, unsubscribe and set up listener.
        if (this.props.concentration != null && prevProps.concentration !== this.props.concentration){
    
            if (this.unsubscribe){
                this.unsubscribe();
            }

            this.setUpListener();

        }

    }

    setUpListener(){

        //Based on concentration sets up listener to that doc.

        const docListeningTo = this.props.concentration;

        const needToKnowRef = this.props.firebase.firestore().collection("Library").doc("Paths").collection("NeedToKnows");

        //Setting up listener
        this.unsubscribe = needToKnowRef.doc(docListeningTo).onSnapshot(doc => {

            console.log("doc data",doc.data());
            this.props.onContentLoaded(doc.data());
        }) 

    }

    render(){

        const {concentration, concentrations, content,
        onConcentrationSelected} = this.props;

        if (concentrations.length == 0){

            return null;
        }

        //Rendering list of concentrations to select from.
        const concentrationsSelection = ( <FilterWrapper>
                
                <FilterItems>
                    {concentrations.map(concentration => {

                            //Will also set style for color;
                            //Setting style.
                        <FilterItem key = {concentration.name} style={{color: concentrations.color}} > {concentration.name}  </FilterItem>
                    })}
                </FilterItems>

            </FilterWrapper>
        )

        var results = null;
        if (concentration == null){

            //Then will prompt them to select a concentration.
            results = (<ResultWrapper>

                    <SelectPrompt> Please select a concentration </SelectPrompt>

                </ResultWrapper>
            )
        }
        else{
            //Other if not null, then display the content.
            //This will just render the NeedToKnow, passing in the content here as attribute.
            //I'll add it after merge it in.

            results = (<ResultWrapper>
                

                
                </ResultWrapper>)

        }


    }
    
}


//I was back in that up all night, can't sleep
//cause of wanting to work on this, wtf happened.
const mapStateToProps = createStructuredSelector({

    firebase: makeSelectFirebase(),
    concentration: makeSelectConcentration(),
    concentrations: makeSelectConcentrations(),
    content : makeSelectContent(),

});

function mapDispatchToProps(dispatch){


    return {

        onConcentrationSelected : (concentration) => {

            return dispatch(concentrationSelected(concentration));
        },

        onConcentrationsLoaded : (concentrations) => {

            return dispatch(concentrationsLoaded(concentrations));
        },

        onContentLoaded : (content) => {

            return dispatch(loadedContent(content));
        }
    }

}

const withConnect = connect(mapStateToProps,mapDispatchToProps);
const withReducer = injectReducer({key:"PathsUnique",reducer});

export default compose(

    withConnect,
    withReducer,

)(PathsUnique);