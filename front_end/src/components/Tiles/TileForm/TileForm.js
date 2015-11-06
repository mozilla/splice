import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

import { displayMessage, shownMessage } from 'actions/App/AppActions';
import { createTile, updateTile, fetchTiles } from 'actions/Tiles/TileActions';
import { bindFormValidators, bindFormConfig } from 'helpers/FormValidators';

window.$ = require('jquery');
window.jQuery = $;
require('jquery-serializejson');
require('bootstrap-colorpicker');
require('bootstrap-colorpicker/dist/css/bootstrap-colorpicker.min.css');

bindFormConfig();
require('parsleyjs');

export default class TileForm extends Component {
  componentDidMount(){
    bindFormValidators();

    $('.js-select').select2();
    $('.colorpicker-input-group').colorpicker({horizontal: true});
  }

  componentDidUpdate(prevProps) {
    if (prevProps.Tile.details.id !== this.props.Tile.details.id ||
        prevProps.AdGroup.details.id !== this.props.AdGroup.details.id){
      bindFormValidators();

      $('.js-select').select2();
      $('.colorpicker-input-group').colorpicker({horizontal: true});
    }
  }

  render() {
    let spinner;
    if(this.props.Tile.isSaving){
      spinner = <img src="/public/img/ajax-loader-aqua.gif" />;
    }

    let data = this.props.Tile.details;
    if(this.props.editMode === false){
      data = {};
    }
    if(data.adgroup_id === undefined){
      data.adgroup_id = this.props.params.adGroupId;
    }

    const categories = this.props.Init.categories.map((row, index) =>
        <option key={'categories-' + index} value={row}>{row}</option>
    );
    const channels = this.props.Init.channels.map((row, index) =>
        <option key={'channel-' + index} value={row.id}>{_.capitalize(row.name)}</option>
    );
    const locales = this.props.Init.locales.map((row, index) =>
        <option key={'locales-' + index} value={row}>{row}</option>
    );

    return (
      <div>
        <form id="TileForm" ref="form" key={'tileform-' + ((this.props.editMode) ? 'edit-' + data.id : 'create-' + data.adgroup_id )}>
          {(this.props.editMode) ? (<input type="hidden" id="TileId" name="id" ref="id" value={data.id}/>) : null}
          <input type="hidden" name="adgroup_id" ref="adgroup_id" value={data.adgroup_id} />

          <div className="container-fluid field-container">
            <div className="row">
              <div className="col-xs-4">
                {(this.props.editMode)
                  ? (<div className="form-group">
                  <label htmlFor="TilePaused">Paused</label>
                  <div className="onoffswitch">
                    <input type="checkbox" name="paused" ref="paused" className="onoffswitch-checkbox" id="TilePaused" defaultChecked={data.paused} value="true"/>
                    <label className="onoffswitch-label" htmlFor="TilePaused"></label>
                  </div>
                </div>)
                  : <input type="hidden" name="paused" ref="paused" value={false}/>
                }
                <div className="form-group">
                  <label htmlFor="TileTitle">Headline</label>
                  <input className="form-control" type="text" id="TileTitle" name="title" ref="title" defaultValue={data.title} data-parsley-required data-parsley-minlength="2"/>
                </div>
                <div className="form-group">
                  <label htmlFor="TileTargetUrl">Clickthrough URL</label>
                  <input className="form-control" type="text" id="TileTargetUrl" name="target_url" ref="target_url" defaultValue={data.target_url} data-parsley-required data-parsley-type="url"/>
                </div>
                <div className="form-group">
                  <label htmlFor="TileEnhancedImageUri">Enhanced Image URI</label>
                  <input className="form-control" type="text" id="TileEnhancedImageUri" name="enhanced_image_uri" ref="enhanced_image_uri" defaultValue={data.enhanced_image_uri} data-parsley-required data-parsley-type="url"/>
                </div>
                <div className="form-group">
                  <label htmlFor="TileImageUri">Image URI</label>
                  <input className="form-control" type="text" id="TileImageUri" name="image_uri" ref="image_uri" defaultValue={data.image_uri} data-parsley-required data-parsley-type="url"/>
                </div>
                <div className="form-group">
                  <label htmlFor="TileBgColor">Background Color</label>
                  <div className="input-group colorpicker-input-group">
                    <span className="input-group-addon"><i></i></span>
                    <input className="form-control" type="text" id="TileBgColor" name="bg_color" ref="bg_color" defaultValue={data.bg_color} data-parsley-required/>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="TileTitleBgColor">Title Background Color</label>
                  <div className="input-group colorpicker-input-group">
                    <span className="input-group-addon"><i></i></span>
                    <input className="form-control" type="text" id="TileTitleBgColor" name="title_bg_color" ref="title_bg_color" defaultValue={data.title_bg_color} data-parsley-required/>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="TileType">Type</label>
                  <select className="form-control" id="TileType" name="type" ref="type" defaultValue={data.type} >
                    <option value="affiliate">Affiliate</option>
                    <option value="sponsored">Sponsored</option>
                  </select>
                </div>
                {(this.props.editMode)
                  ? (<div className="form-group">
                  <label htmlFor="TileStatus">Approval Status</label>
                  <select className="form-control" id="TileStatus" name="status" ref="status" defaultValue={data.status} >
                    <option value="unapproved">Unapproved</option>
                    <option value="disapproved">Disapproved</option>
                    <option value="approved">Approved</option>
                  </select>
                </div>)
                  : <input type="hidden" name="status" ref="status" value="unapproved"/>}
              </div>
            </div>
          </div>

          <button onClick={(e) => this.handleFormSubmit(e)} className="form-submit">Save {spinner}</button>
        </form>
      </div>
    );
  }

  handleFormSubmit(e) {
    e.preventDefault();

    const form = $('#TileForm').parsley();

    if(form.validate()){
      const data = JSON.stringify($('#TileForm').serializeJSON());

      //Handle Update or Create
      if(this.props.editMode){
        this.handleUpdate(data);
      }
      else{
        this.handleCreate(data);
      }
    }
    else{
      const { dispatch } = this.props;
      dispatch(displayMessage('error', 'Validation Errors') );
      dispatch(shownMessage());
      window.scrollTo(0, 0);
    }
  }

  handleCreate(data){
    const { dispatch } = this.props;
    const context = this;

    dispatch(createTile(data))
      .then(function(response){
        context.handleResponse(response);
      });
  }

  handleUpdate(data){
    const { dispatch } = this.props;
    const context = this;

    dispatch(updateTile(this.props.Tile.details.id, data))
      .then(function(response){
        context.handleResponse(response);
      }
    );
  }

  handleResponse(response){
    const { dispatch, history } = this.props;

    if(response.result === undefined){
      dispatch(displayMessage('error', response.message) );
      dispatch(shownMessage());
      window.scrollTo(0, 0);
    }
    else{
      if(this.props.editMode){
        dispatch(displayMessage('success', 'Tile Updated Successfully') );
      }
      else{
        dispatch(displayMessage('success', 'Tile Created Successfully') );
      }
      history.pushState(null, '/tiles/' + response.result.id);
    }
  }
}

TileForm.propTypes = {
  editMode: PropTypes.bool.isRequired
};
