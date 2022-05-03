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
  `

// const ast = parse(some_json_string);
const ast = parseForESLint(some_tf_string, {});
// const ast = getTokens(some_tf_string);
const goatAst = parseForESLint(terraGoat, {})

console.log(JSON.stringify(goatAst, null, 3));
// console.log(JSON.stringify(ast, null, 3));
// console.log(ast);
// 