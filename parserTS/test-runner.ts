import { parseForESLint } from "./index";
import { parseForESLint as jsonParse } from 'jsonc-eslint-parser'
import { getTokens } from "./src/Tokens";

const some_tf_string = `resource "google_compute_ssl_policy" "vulnerable_example" { 
                                name = "production-ssl-policy"
                                profile = "MODERN"
                                min_tls_version = "TLS_1_0"
                            }
                        `;

const complex_tf_string =
  `resource "google_compute_ssl_policy" "vulnerable_example" {
                          name = "production-ssl-policy"
                            profile = "MODERN"
                            min_tls_version = "TLS_1_0"
                          }

                        resource "google_compute_ssl_policy" "SECOND_EXAMPLE" { 
                            name = "production-ssl-policy"
                            profile = "MODERN"
                            min_tls_version = "TLS_1_0"
                        }
`;

const emptyString = `;`

const test_string = `{ resource "name" "name2"}`;


const extendingParser1 = `resource "google_bigquery_dataset" "dataset" {
  dataset_id = "terragoat__dataset"
  access {
    special_group = "allAuthenticatedUsers"
    role          = "READER"
  }
  labels = {
    git_commit           = "2bdc0871a5f4505be58244029cc6485d45d7bb8e"
    git_file             = "terraform__gcp__big_data_tf"
    git_last_modified_at = "2022-01-19-17-02-27"
    git_last_modified_by = "jameswoolfenden"
    git_modifiers        = "jameswoolfenden__nimrodkor"
    git_org              = "bridgecrewio"
    git_repo             = "terragoat"
    yor_trace            = "2560d883-bc3a-4cb6-b9fc-fb666edf626e"
  }
}
`

const terraGoat = `resource "google_sql_database_instance" "master_instance" {

  database_version = "POSTGRES_11"
  
  settings {
    tier = "db-f1-micro"
    ip_configuration {
      ipv4_enabled = true
      authorized_networks {
        name  = "WWW"
        value = "0.0.0.0/0"
      }
    }
    backup_configuration {
      enabled = false
    }
  }
}

resource "google_bigquery_dataset" "dataset" {
  dataset_id = "terragoat__dataset"
  access {
    special_group = "allAuthenticatedUsers"
    role          = "READER"
  }
  labels = {
    git_commit           = "2bdc0871a5f4505be58244029cc6485d45d7bb8e"
    git_file             = "terraform__gcp__big_data_tf"
    git_last_modified_at = "2022-01-19-17-02-27"
    git_last_modified_by = "jameswoolfenden"
    git_modifiers        = "jameswoolfenden__nimrodkor"
    git_org              = "bridgecrewio"
    git_repo             = "terragoat"
    yor_trace            = "2560d883-bc3a-4cb6-b9fc-fb666edf626e"
  }
}
`

const terragoatNetworks = `resource "google_compute_network" "vpc" {
  name                    = "terragoat--network"
  description             = "Virtual vulnerable-by-design network"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "public-subnetwork" {
  name          = "terragoat--public-subnetwork"
  ip_cidr_range = "10.0.0.0/24"


  secondary_ip_range {
    range_name    = "tf-test-secondary-range-update1"
    ip_cidr_range = "192.168.10.0/24"
  }
}

resource "google_compute_firewall" "allow_all" {
  name          = "terragoat--firewall"

  source_ranges = ["0.0.0.0/0"]
  allow {
    protocol = "tcp"
    ports    = ["0-65535"]
  }
}`

const ip = `ip_cidr_range = "10.0.0.0/24"`
const list = `blockRange = {"text" "NewText"}
listRange = ["listtext"]`

const ourTest = `resource "google_compute_ssl_policy" "vulnerable_example1" { 
  name = "production-ssl-policy"
  profile = "COMPATIBLE"
  min_tls_version = "TLS_1_0"
}

resource "google_compute_ssl_policy" "vulnerable_example2" { 
  name = "production-ssl-policy"
  profile = "MODERN"
  min_tls_version = "TLS_1_0"
}

resource "google_compute_ssl_policy" "safe_example" { 
  name = "production-ssl-policy"
  profile = "RESTRICTED"
  min_tls_version = "TLS_1_0"
}

resource "google_compute_ssl_policy" "best_example" { 
  name = "production-ssl-policy"
  profile = "RESTRICTED"
  min_tls_version = "TLS_1_2"
}

resource "google_sql_database_instance" "postgres" {
name                = "postgress-db-instance"
database_version    = "POSTGRES"
settings {
tier = "db-f1-micro"
ip_configuration {
authorized_networks {
    value           = "108.12.12.0/24"
    name            = "internal"
}
authorized_networks {
    value           = "0.0.0.0/0"
    name            = "internet"
} 
}
}
}



resource "google_compute_region_backend_service" "bad_example" {
name                            = "logging-test"
region                          = "us-central1"
health_checks                   = [google_compute_region_health_check.region.id]
connection_draining_timeout_sec = 10
session_affinity                = "CLIENT_IP"
load_balancing_scheme           = "EXTERNAL"
protocol                        = "HTTP"

log_config {
enable = false
}
}

resource "google_compute_region_backend_service" "vulnerable_to_educate" {
name                            = "logging-test"
region                          = "us-central1"
health_checks                   = [google_compute_region_health_check.region.id]
connection_draining_timeout_sec = 10
session_affinity                = "CLIENT_IP"
load_balancing_scheme           = "EXTERNAL"
protocol                        = "HTTPS"
}

resource "google_compute_region_backend_service" "withlogs" {
name                            = "logging-test"
region                          = "us-central1"
health_checks                   = [google_compute_region_health_check.region.id]
connection_draining_timeout_sec = 10
session_affinity                = "CLIENT_IP"
load_balancing_scheme           = "EXTERNAL"
protocol                        = "HTTPS"

log_config {
enable = true
}
}

resource "google_bigquery_connection" "vulnerable" {
provider      = google-beta
friendly_name = "bigquery-connection"
description   = "a riveting description"
cloud_sql {
instance_id = google_sql_database_instance.instance.connection_name
database    = google_sql_database.db.name
type        = "POSTGRES"
credential {
username = "name@email.com"
password = "change-me-later"
}
}
}
`

// const ast = parse(some_json_string);
// const ast = parseForESLint(complex_tf_string, {});
// const jsonAst = jsonParse(json_string)
// const ast = getTokens(some_tf_string);

// console.log(jsonAst)
// console.log(ast)

const ast = parseForESLint(extendingParser1, {});
console.log(JSON.stringify(ast, null, 3));


// Tokens
// const tokens = getTokens(terraGoat)

// // Terragoat
// const goatAst = parseForESLint(terraGoat, {})
// console.log(JSON.stringify(goatAst, null, 3));