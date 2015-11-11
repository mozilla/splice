import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

import { displayMessage, shownMessage } from 'actions/App/AppActions';
import { createTile, updateTile, fetchTiles, uploadImage, tileSetDetailsVar } from 'actions/Tiles/TileActions';
import { bindFormValidators, bindFormConfig } from 'helpers/FormValidators';

import TileDropzone from 'components/Tiles/TileDropzone/TileDropzone';

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
    this.bindColorPickerEvents();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.Tile.details.id !== this.props.Tile.details.id ||
        prevProps.AdGroup.details.id !== this.props.AdGroup.details.id){
      bindFormValidators();

      $('.js-select').select2();
      this.bindColorPickerEvents();
    }
  }

  render() {
    let spinner;
    if(this.props.Tile.isSaving){
      spinner = <img src="/public/img/ajax-loader-aqua.gif" />;
    }

    const data = this.props.Tile.details;

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
                  <input className="form-control" onChange={(e) => this.handleChangeField(e, 'title')} type="text" id="TileTitle" name="title" ref="title" value={data.title} data-parsley-required data-parsley-minlength="2"/>
                </div>
                {(this.props.editMode === false) ?
                  (<div>
                    <div className="form-group">
                      <label htmlFor="TileTargetUrl">Clickthrough URL</label>
                      <input className="form-control" type="text" id="TileTargetUrl" name="target_url" ref="target_url" defaultValue={data.target_url} data-parsley-required data-parsley-type="url"/>
                    </div>
                  </div>)
                  : null
                }
                <div className="form-group">
                  <label htmlFor="TileBgColor">Background Color</label>
                  <div className="input-group colorpicker-input-group" data-field="bg_color">
                    <span className="input-group-addon"><i></i></span>
                    <input className="form-control" type="text" onChange={(e) => this.handleChangeField(e, 'bg_color')} id="TileBgColor" name="bg_color" ref="bg_color" value={data.bg_color} />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="TileTitleBgColor">Title Background Color</label>
                  <div className="input-group colorpicker-input-group" data-field="title_bg_color">
                    <span className="input-group-addon"><i></i></span>
                    <input className="form-control" onChange={(e) => this.handleChangeField(e, 'title_bg_color')} type="text" id="TileTitleBgColor" name="title_bg_color" ref="title_bg_color" value={data.title_bg_color} />
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
                      ? ( <div className="hide">
                        <div className="form-group">
                          <label htmlFor="TileStatus">Approval Status</label>
                          <select className="form-control" id="TileStatus" name="status" ref="status" defaultValue={data.status} disabled="true">
                            <option value="unapproved">Unapproved</option>
                            <option value="disapproved">Disapproved</option>
                            <option value="approved">Approved</option>
                          </select>
                        </div>
                      </div>)
                    : <input type="hidden" name="status" ref="status" value="unapproved"/>}
              </div>
              <div className="col-xs-4 col-xs-push-4">
                {(this.props.editMode === false) ?
                  <div>
                    <div className="form-group">
                      <label >Static Image</label>
                      <TileDropzone Tile={this.props.Tile} fieldName="enhanced_image_uri" handleFileUpload={(file) => this.handleFileUpload(file, 'enhanced_image_uri')} />
                      <label >Static Image URI</label>
                      <input className="form-control" onChange={(e) => this.handleChangeField(e, 'enhanced_image_uri')} type="text" id="TileEnhancedImageUri" name="enhanced_image_uri" ref="enhanced_image_uri" value={data.enhanced_image_uri} data-parsley-required data-parsley-type="url"/>
                    </div>
                    <div className="form-group">
                      <label >Rollover Image</label>
                      <TileDropzone Tile={this.props.Tile} fieldName="image_uri" handleFileUpload={(file) => this.handleFileUpload(file, 'image_uri')} />
                      <label htmlFor="TileImageUri">Rollover Image URI</label>
                      <input className="form-control" onChange={(e) => this.handleChangeField(e, 'image_uri')} type="text" id="TileImageUri" name="image_uri" ref="image_uri" value={data.image_uri} data-parsley-required data-parsley-type="url"/>
                    </div>
                  </div>
                  :
                  <div>
                    <div className="tile-preview">
                      <div className="tile-image" style={ { backgroundColor: this.props.Tile.details.bg_color, backgroundImage: 'url(' + this.props.Tile.details.enhanced_image_uri + ')' } }></div>
                      <div className="tile-title" style={ {backgroundColor: this.props.Tile.details.title_bg_color} }>{this.props.Tile.details.title}</div>
                    </div>
                    <br/>
                    <label className="tile-label"> Static Image</label>
                    <div className="tile-preview">
                      <div className="tile-image" style={ { backgroundColor: this.props.Tile.details.bg_color, backgroundImage: 'url(' + this.props.Tile.details.image_uri + ')' } }></div>
                      <div className="tile-title" style={ {backgroundColor: this.props.Tile.details.title_bg_color} }>{this.props.Tile.details.title}</div>
                    </div>
                    <br/>
                    <label className="tile-label"> Rollover Image</label>
                  </div>
                }
              </div>
            </div>
          </div>

          <button onClick={(e) => this.handleFormSubmit(e)} className="form-submit">Save {spinner}</button>
        </form>
      </div>
    );
  }

  bindColorPickerEvents(){
    const context = this;

    $('.colorpicker-input-group').colorpicker({horizontal: true}).on('changeColor.colorpicker', function(e){
      const field = $(e.target).attr('data-field');
      const value = $(e.target).find('input').val();

      context.props.dispatch(tileSetDetailsVar(field, value));
    });

    $('.colorpicker-input-group input').on('blur', function(e){
      const field = $(e.target).parents('.colorpicker-input-group').attr('data-field');

      context.props.dispatch(tileSetDetailsVar(field, e.target.value));
    });
  }

  handleChangeField(e, field){
    const { dispatch } = this.props;

    dispatch(tileSetDetailsVar(field, e.target.value));
  }

  handleFileUpload(file, fieldName) {
    const { dispatch } = this.props;

    const data = new FormData();
    data.append('creative', file[0]);

    dispatch(uploadImage(data, isEnhanced))
      .then(function(response){
        if(response.result !== undefined){
          dispatch(tileSetDetailsVar(fieldName, response.result));
        }
      }
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
