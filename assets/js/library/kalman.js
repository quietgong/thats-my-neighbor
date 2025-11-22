class KalmanFilterGps {
    constructor(R = 0.00001, Q = 0.0001) {
        this.R = R; // GPS 측정 노이즈(작을수록 강하게 필터링)
        this.Q = Q; // 프로세스 노이즈(작을수록 기존 위치 유지)

        this.lat = null;
        this.lng = null;

        this.P_lat = 1;
        this.P_lng = 1;
    }

    filter(lat, lng) {
        if (this.lat === null) {
            // 최초 초기화
            this.lat = lat;
            this.lng = lng;
            return { lat, lng };
        }

        // ------ LAT ------
        this.P_lat = this.P_lat + this.Q;
        const K_lat = this.P_lat / (this.P_lat + this.R);
        this.lat = this.lat + K_lat * (lat - this.lat);
        this.P_lat = (1 - K_lat) * this.P_lat;

        // ------ LNG ------
        this.P_lng = this.P_lng + this.Q;
        const K_lng = this.P_lng / (this.P_lng + this.R);
        this.lng = this.lng + K_lng * (lng - this.lng);
        this.P_lng = (1 - K_lng) * this.P_lng;

        return { lat: this.lat, lng: this.lng };
    }
}
