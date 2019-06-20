import { Client, RequestParams, ApiResponse } from '@elastic/elasticsearch'

import { Config, ElasticsearchConfig } from './config'

export default class Indices {
  static client: Client

  private constructor(elasticsearch: ElasticsearchConfig) {
    if (!Indices.client) {
      Indices.client = new Client({ ...elasticsearch.options })
    }
  }

  static async init(config: Config): Promise<void> {
    const indices = new Indices(config.elasticsearch)
    for (let index of config.elasticsearch.indices) {
      index.index += config.controls.indexNameSuffix
      if (!(await indices.exists(index))) {
        await indices.create(index)
        console.log('create index', index.index)
      }
    }
    for (let task of config.tasks) {
      task.load.index += config.controls.indexNameSuffix
      await indices.putMapping(task.load)
      console.log('put mapping', task.load.index, task.load.type)
    }
  }

  async create(params: RequestParams.IndicesCreate): Promise<any> {
    return await Indices.client.indices.create(params)
  }

  async putMapping(params: RequestParams.IndicesPutMapping): Promise<any> {
    return await Indices.client.indices.putMapping(params)
  }

  async exists(params: RequestParams.IndicesExists): Promise<boolean> {
    const response: ApiResponse = await Indices.client.indices.exists(params)
    return response.body
  }
}
