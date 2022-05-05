import { parseForESLint } from "terraform-estree-parser";


const some_tf_string = `resource "google_compute_ssl_policy" "vulnerable_example" { 
                                name = "production-ssl-policy"
                                profile = "MODERN"
                                min_tls_version = "TLS_1_0"
                            }
                        `;

const test_string = `{ resource "name" "name2"}`;

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

const extendingParser = `resource "google_sql_database_instance" "master_instance" {

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
}`

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
const ip = `ip_cidr_range = "10.0.0.0/24"`

const terragoatNetworks = `resource "google_compute_network" "vpc" {
  name                    = "terragoat--network"
  description             = "Virtual vulnerable-by-design network"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "public-subnetwork" {
  name          = "terragoat--public-subnetwork"
  ip_cidr_range = "10.0.0.0/24"
  region        = var.region
  network       = google_compute_network.vpc.id

  secondary_ip_range {
    range_name    = "tf-test-secondary-range-update1"
    ip_cidr_range = "192.168.10.0/24"
  }
}

resource "google_compute_firewall" "allow_all" {
  name          = "terragoat--firewall"
  network       = google_compute_network.vpc.id
  source_ranges = ["0.0.0.0/0"]
  allow {
    protocol = "tcp"
    ports    = ["0-65535"]
  }
}`
// Original 
// const ast = parseForESLint(some_tf_string, {});
// console.log(JSON.stringify(ast, null, 3));
// const ast = getTokens(some_tf_string);

// // Terragoat
// const goatAst = parseForESLint(terraGoat, {})
// console.log(JSON.stringify(goatAst, null, 3));

// Terragoat
const goatNet = parseForESLint(terragoatNetworks, {})
console.log(JSON.stringify(goatNet, null, 3));


// extend Parser 
// const extendpaser = parseForESLint(extendingParser, {});
// console.log(JSON.stringify(extendpaser, null, 3));

// // extend Parser1
// const extendpaser = parseForESLint(extendingParser1, {});
// console.log(JSON.stringify(extendpaser.ast, null, 3));


// console.log(ast);
// 