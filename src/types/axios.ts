import type {
  AxiosRequestConfig,
  AxiosResponse,
  Axios,
  AxiosPromise,
  AxiosResponseHeaders
} from 'axios'

export interface IAxiosRequestConfig<D = any> extends AxiosRequestConfig<D> {
  isCustomCatchError?: Boolean // 是否自定义捕获错误
  preventTransParams?: Boolean // 是否阻止映射 params 参数
}

export interface IAxios extends Axios {
  get<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    config?: IAxiosRequestConfig<D>
  ): Promise<R>
  delete<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    config?: IAxiosRequestConfig<D>
  ): Promise<R>
  head<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    config?: IAxiosRequestConfig<D>
  ): Promise<R>
  options<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    config?: IAxiosRequestConfig<D>
  ): Promise<R>
  post<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: IAxiosRequestConfig<D>
  ): Promise<R>
  put<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: IAxiosRequestConfig<D>
  ): Promise<R>
  patch<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: IAxiosRequestConfig<D>
  ): Promise<R>
}

export interface IAxiosInstance extends IAxios {
  (config: IAxiosRequestConfig): AxiosPromise
  (url: string, config?: IAxiosRequestConfig): AxiosPromise
}

export interface IAxiosResponse<T = any, D = any> {
  data: T
  status: number
  statusText: string
  headers: AxiosResponseHeaders
  config: IAxiosRequestConfig<D>
  request?: any
}
