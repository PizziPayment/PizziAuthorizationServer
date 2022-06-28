export const client = { id: 'Pizzi-client-test', secret: 'secret' }
export const client_header = { Authorization: 'Basic ' + Buffer.from(`${client.id}:${client.secret}`).toString('base64') }

export const user = {
  name: 'Valérie',
  surname: 'Précaire',
  email: 'valerie@example.com',
  password: 'gY@3Cwl4FmLlQ@HycAf',
  place: {
    address: '13 rue de la ville',
    city: 'Ville',
    zipcode: 25619,
  },
}

export const shop = {
  name: 'toto',
  email: 'toto@tutu.tata',
  password: 'gY@3Cwl4FmLlQ@HycAf',
  phone: '0652076382',
  place: {
    address: '13 rue de la ville',
    city: 'Ville',
    zipcode: 25619,
  },
}
