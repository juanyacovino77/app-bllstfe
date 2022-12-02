import { useEffect, useState } from 'react';
import { Text, View, Image, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { FakeCurrencyInput } from 'react-native-currency-input';
import  LoadingModal from './components/LoadingModal.js';

const LOCALES = new Map([
  [1, ["SUPER_CAJA1", "SUPER_CAJA2", "SUPER_CAJA3"]],
  [2, ["YSND_CAJA1", "YSND_CAJA2"]],                 
  [3, ["FANTI_CAJA1", "FANTI_CAJA2"]],                
  [4, ["VILLA_CAJA1"]]]);   
  
const TIEMPO_VENCIMIENTO = 60;


export default function App() {
  const [local, setLocal] = useState(1);
  const [caja, setCaja] = useState("");
  const [monto, setMonto] = useState(0,0);
  const [token, setToken] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [estado, setEstado] = useState("");
  const [modal, setModal] = useState(false);
  const [cuenta, setCuenta] = useState(TIEMPO_VENCIMIENTO);


  const iniciarSesion = async () => {
    let url = 'https://botonpp.asjservicios.com.ar:8082/v1/sesion'
    try {
     const response = await fetch(url,
      {
        method:'POST',
        headers:{'Content-Type': 'application/json'},
        body: JSON.stringify(
          {'guid':'2ec651a8-258b-476f-a983-8e4d0c997501',
           'frase':'kSGrfuE2CaaPjtgldyH4BSF72lc0GHMryej7M9ZvagA='
          })
      });
      
     const json = await response.json();
     setToken(json.data);
   }
   catch (error) {console.error(error);} finally {}
  }

  const crearOrden = async () => {
    let url = 'https://botonpp.asjservicios.com.ar:8082/v1/order/' + caja;
    let bearer_token = 'Bearer ' + token;

    try {
     const response = await fetch(url,
      {
        method:'POST',
        headers:
        {
          'Content-Type': 'application/json',
          'Authorization': bearer_token,
          'X-Ttl-Preference': TIEMPO_VENCIMIENTO
        },
        body: JSON.stringify
        ({
          'MontoTotal': monto?.toFixed(2), 
          'IdTransaccionInterno': Math.random(),
          'Productos':''
          })
      });
      
     const json = await response.json();
     setRespuesta(json);

     if(json.code == '201') { setModal(true); setCuenta(TIEMPO_VENCIMIENTO); }
   }
   catch (error) {console.error(error);} finally {}
  }

  const consultarOrden = async () => {
    await sondearOrden({intervalo:1000, maxIntentos:TIEMPO_VENCIMIENTO, ordenId: respuesta.data?.ordenId})
      .then(est => {console.log('la orden rechazada o fue pagada' + est);})
      .catch(error => {console.log(error); setEstado('VENCIDA');})
      .finally(() => { setTimeout(()=>{setModal(false)},3000); }); 

  }

  const sondearOrden = async ({intervalo, maxIntentos, ordenId}) => {
    try {
      console.log('Orden creada exitosamente, sondeanado el estado...');
      let intentos = 0;
    
      const executePoll = async (resolve, reject) => {
        console.log('sondendo el estado de la orden.....');
        let url = 'https://botonpp.asjservicios.com.ar:8082/v1/order?ordenId=' + ordenId

        const result = await fetch(url,
        {
        method:'GET', 
        headers:{
          'Authorization': 'Bearer '+ token,
          'Content-Type': 'application/json'}
        });
  
        const json = await result.json();

        if(json?.code != '200'){ return reject(new Error(json?.message))};

        const estadoo = json?.data?.estado;
        setEstado(json?.data?.estado);

        intentos++;
        let faltan = cuenta - intentos
        setCuenta(faltan);

        console.log('Estado actual de la orden es ' + estadoo)

        if (estadoo === "APROBADA" || estadoo === "RECHAZADA") 
        { return resolve(estadoo); } 
        else if (maxIntentos && intentos === maxIntentos) 
        { return reject(new Error('vencida')); } 
        else { setTimeout(executePoll, intervalo, resolve, reject); }
      };
    
      return new Promise(executePoll);
      
    } catch (error) {console.error("excepcion" + error)
      
    }
  
  };

  useEffect(() => {iniciarSesion();}, []);

  return (
    <View style={{ flex: 1, flexDirection:'column', justifyContent: "center", alignItems:"center"}}>

      <View style={{alignItems:'center'}}>
        <Image 
              source={require('./assets/logo.png')}
              style={{width:250, height:250, marginTop:-150}}>
        </Image>
      </View>

      <View style={{marginTop:30,}}>
        <Picker 
              style={{}} 
              selectedValue={local} 
              onValueChange={(v, i) => {setLocal(v); setCaja("");}}>

          <Picker.Item label='SUPER' value={1}></Picker.Item>
          <Picker.Item label='YSND'  value={2}></Picker.Item>
          <Picker.Item label='FANTI' value={3}></Picker.Item>
          <Picker.Item label='VILLA' value={4}></Picker.Item>
        </Picker>

        <Picker 
              style={{widht:300}} 
              selectedValue={caja} 
              onValueChange={(v, i) => setCaja(v)}>

          <Picker.Item enabled={false} label='Seleccione una caja' value={''}></Picker.Item>
          {LOCALES.get(local).map((item) => {return <Picker.Item label={item} value={item} key={item}></Picker.Item>})}
        </Picker>

        <FakeCurrencyInput
              value={monto}
              onChangeValue={setMonto}
              style={{fontSize:50, textAlign:'center', paddingBottom:20}}
              prefix="$"
              precision={2}
              delimiter="."
              separator=","
              minValue={0}>
        </FakeCurrencyInput>

        <Text style={{paddingBottom:15, fontWeight:"100"}}>Respuesta crear orden: {respuesta.message} id orden : {respuesta.data?.ordenId}</Text> 

        <Text style={{paddingBottom:15, fontWeight:"100"}}>Respuesta consultar orden: {estado}</Text> 

        <Button 
              title='CONFIRMAR' 
              disabled={caja != "" ? false : true} 
              onPress={() => crearOrden()}>
        </Button>

        <LoadingModal
              onModalShow={consultarOrden}
              modalVisible={modal}
              task={'Orden de pago: '+ (respuesta.data?.ordenId) + "\n" + "\n" + (estado ?? '')}
              estado={estado}
              countDown={cuenta}> 
        </LoadingModal>
      </View>
    </View>
  );
}







