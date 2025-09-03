export type BotSignaturesType = string[]

export type ClassificationWeightsType = {
  l1_headers: number
  l2_network_type: number
  l3_tor_vpn_proxy: number
}

export type ClassificationConfigType = {
  weights: ClassificationWeightsType
  botSignatures: BotSignaturesType
  botThreshold: number
}

export type Config = {
  classification: ClassificationConfigType
}

const config: Config = {
  classification: {
    weights: {
      l1_headers: 0.35,
      l2_network_type: 0.35,
      l3_tor_vpn_proxy: 0.3,
    },
    botSignatures: [
      'curl',
      'python-requests',
      'httpclient',
      'wget',
      'node-fetch',
      'go-http-client',
      'libwww-perl',
    ],
    botThreshold: 0.7
  },
}
export default () => config
