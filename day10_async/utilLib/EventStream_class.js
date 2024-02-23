
    /** EventStream Class ===========================================================================================
     * Provides a means of publishing and subscribing to a stream of events.
     * Events are objects that are published by a publisher to any number of subscribers.
     * Events are published in streams. The publisher uses a stream to publish events,
     * and many subscribers can use the stream to subscribe to those events. The publisher
     * optionally sends data with the event, which is sent to all subscribers.
     * When the publisher publishes an event the stream sends it **asynchronously** to all 
     *  the subscribers who have matching subscription keys.
     * An event has a type, which is a string set by the publisher. An event type can have multiple parts, each separated by a dot
     * A subscriber can specify which type of event they wish to recieve, by specifying the type string. A subscriber can use
     * an * as any part of a key to denote that they will accept any value in that part of the key. An * at the end of a subscription
     * key will match an event key that has multiple parts beyond the position of the *.
     * 
     * Example.                 Event with key A.B.C.D  Event with key A.X.Y.D
     *  Subscriber to key        - receives the event?    - receives the event?
     *  A.B.C.D                     yes                         No
     *  A                           No                          No
     *  A.*                         Yes                         Yes
     *  A.*.C                       No                          No
     *  A.*.C.*                     Yes                         No
     *  A.*.*.D                     Yes                         Yes
     *  
     * When registering to receive events, a subscriber may optionally supply a single data item
     * (of any type) to be associated with the subscription. This data is returned with the event
     * every time an event in the stream is sent to the subscriber.
     *  
     * */
    var eventSerial = 0;
    class EventStream{

        // List of subscribers
        subs = [];
        name = "";
        verbose = false;

        // Logging function
        log(xx, yy){ 
            console.log( `E[${this.name}]:`, xx ) ; 
            if(yy) console.log("           :", yy);
        };

        /** 
         * Subscribe function called by a consumer of 
         * events to register an event handler function, The
         * event handler function is called to handle the
         * event when an event is published with a matching
         * event type.
         * */
        on(type, handler , userData ){
            //this.log(`subscribing type ${type} with subtype ${ type.slice(0,-1) }`);
            let keys = type.split(".");
            let sub = { type, keys, handler, userData }
            //this.log("Registering event subscriber ", sub)

            this.subs.push( sub );
        }

        /**
         * Constructor for the event stream. The Optional
         * parameter is a string naming the event stream.
         * If given, the stream is added as a global 
         * variable with the name of the event stream.
         * @param {string} esName 
         */
        constructor( esName ){
            if( typeof esName == "string"&& esName.length > 0 ) {this.name = esName} else {esName = ""};
            let me = this;
            
            if(esName.length>0) window[esName] = me;

            this.raise = 
                function(type, eventData = {} ){
                    try{ eventData.sn = eventSerial++ } catch(e){};
                    this.log(`>>>>>>>>>>>>>>>>>>>>>>>> raising type ${type}`)
                    let evKeys = type.split(".");
                    let notifyType = (this.name.length>0? this.name + " " : "" ) + type;
                    me.subs.forEach( 
                        sub=>{
                            //this.log(`-- checking`, sub)
                            if(sub.keys.length > evKeys.length) return;
                            if (
                                sub.keys.every(
                                    (key, ix)=>{
                                        switch(true){
                                            // case ix >= evKeys.length:
                                            //     return false;
                                            case key == "*":            // wild card on the listener key
                                            case key == evKeys[ix]:     // match event to listener key
                                            case evKeys[ix]=="*":       // wild card on event key
                                                return true;            // we have a match
                                            default:
                                                return false;
                                        }
                                    }
                                )
                            ){
                                // This is the async function call to actually send the event to the 
                                // event handler for the subscriber.
                                setTimeout( 
                                    ()=>{
                                        sub.handler(notifyType, eventData, sub.userData );
                                    }
                                    , 10
                                );
                            }
                        }
                    );
                };
                
        };
    };

// =====================================================================================================
