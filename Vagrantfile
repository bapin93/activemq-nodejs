# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

  config.vm.box = "Ubuntu precise 32 VirtualBox"
  config.vm.box_url = "http://files.vagrantup.com/precise32.box"

  $script = <<EOF
echo "Atualizando repositorios apt..."
sudo apt-get update

echo "Instalando openjdk-6..."
sudo apt-get install openjdk-6-jdk -q -y --fix-missing

echo "Instalando unzip e vim..."
sudo apt-get install -y unzip vim vim-gtk
sudo mkdir /opt/ips
EOF

  config.vm.provision :shell, :inline => $script

  config.vm.define :mq do |mq_config|
    mq_config.vm.hostname = "activemq-server"
    mq_config.vm.network :private_network, ip: "192.168.0.10"
    mq_config.vm.network "forwarded_port", guest: 61613, host: 61613
    mq_config.vm.network "forwarded_port", guest: 61616, host: 61616
    mq_config.vm.network "forwarded_port", guest: 8161, host: 8161
    mq_config.vm.network "forwarded_port", guest: 3306, host: 5555

    mq_config.vm.provider :virtualbox do |vb|
      vb.customize ["modifyvm", :id, "--memory", "1024", "--ioapic", "on"]
    end
    
    $script = <<EOF
if [ ! -e "/usr/lib/jvm/jdk1.6.0_45" ]; then
    echo "Instalando java oracle 1.6..."
    export JDK_URL="http://download.oracle.com/otn-pub/java/jdk/6u45-b06/jdk-6u45-linux-i586.bin"
    if [ ! -e "/tmp/jdk.bin" ]; then
        wget --no-cookies --no-check-certificate --header "Cookie: gpw_e24=http%3A%2F%2Fwww.oracle.com%2F" "$JDK_URL" -O /tmp/jdk.bin
    fi
    #unzip /tmp/jdk.bin -d /tmp
    cd /tmp
    sh jdk.bin
    sudo mv /tmp/jdk1.6.0_45 /usr/lib/jvm/
    sudo ln -s /usr/lib/jvm/jdk1.6.0_45 /usr/lib/jvm/java-6-oracle
    sudo update-alternatives --install /usr/bin/java java /usr/lib/jvm/java-6-oracle/jre/bin/java 1
    sudo update-alternatives --set java /usr/lib/jvm/java-6-oracle/jre/bin/java
    echo "export JAVA_HOME=/usr/lib/jvm/java-6-oracle" | sudo tee /etc/profile.d/jdk.sh
fi


if [ ! -e "/opt/ips/activemq" ]; then
    echo "ActiveMQ..."
    URL="http://ftp.unicamp.br/pub/apache/activemq/apache-activemq/5.9.0/apache-activemq-5.9.0-bin.tar.gz"
    wget -c "$URL" -O /tmp/activemq.tar.gz
    tar zxvf /tmp/activemq.tar.gz -C /tmp
	  rm /tmp/activemq.tar.gz
    sudo mv /tmp/apache-activemq-5.9.0 /opt/ips/activemq
    sudo ln -s /opt/ips/activemq /opt/
    sudo chown vagrant.vagrant -Rf /opt/ips/activemq
    echo "export PATH=\\$PATH:/opt/ips/activemq/bin" | sudo tee -a /etc/profile.d/activemq.sh
    /opt/ips/activemq/bin/activemq setup $HOME/.activemq
    /opt/ips/activemq/bin/activemq start
fi

echo mysql-server mysql-server/root_password select "root" | sudo debconf-set-selections
echo mysql-server mysql-server/root_password_again select "root" | sudo debconf-set-selections
sudo apt-get install -y mysql-server
mysql -u root -p"root" -e ";DROP DATABASE test;DROP USER ''@'localhost';CREATE DATABASE ipsmq;GRANT ALL ON ipsmq.* TO ipsmq@localhost IDENTIFIED BY 'ipsmq';GRANT ALL ON ipsmq.* TO ipsmq@'%' IDENTIFIED BY 'ipsmq'"
sudo sed -i 's/127.0.0.1/0.0.0.0/g' /etc/mysql/my.cnf
sudo service mysql restart
sudo apt-get clean
EOF

    mq_config.vm.provision :shell, :inline => $script

  end
end
