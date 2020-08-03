import React, { useState, useEffect } from 'react'
import { Checkbox } from 'semantic-ui-react'

export default function BotGrapj(){
    return(
        <>
        <Checkbox inverted toggle label="PLAYER/BANKER"></Checkbox>
        <Checkbox inverted toggle label="PLAYER"></Checkbox>
        <Checkbox inverted toggle label="BANKER"></Checkbox>
        {/* <div class="ui toggle checkbox">
            <input type="checkbox" name="public" checked="checked" />
        </div>
        <div inverted class="ui toggle checkbox">
            <input type="checkbox" name="public" />
            <label>บอท PLAYER</label>
        </div>
        <div inverted class="ui toggle checkbox">
            <input type="checkbox" name="public" />
            <label>บอท BANKER</label>
        </div> */}
        </>
    )
}